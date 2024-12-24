import { insertFormPayment, insertPayment } from "~~/server/api/v1/forms/utils/queries";
import { H3Event } from "h3";

export function _getRequestIP(event: H3Event): string {
	let ip = getRequestIP(event)?.toString();

	if (!ip) {
		ip = (event.node.req.headers["x-forwarded-for"] || event.node.req.connection.remoteAddress)?.toString();
	}

	return ip || "";
}

export default defineEventHandler(async (event) => {
	const hook = (await readBody(event)) as StkCallbackHook;
	const callback = hook.Body.stkCallback;
	if (!callback) {
		throw createError({
			statusCode: 400,
			message: "No callback found",
		});
	}

	const channelName = createChannelName(callback.CheckoutRequestID, callback.MerchantRequestID);
	if (isProduction) {
		const ip = _getRequestIP(event);
		if (!ip) {
			log.error("No IP found");
			global.channels?.publish(channelName, {
				statusCode: 400,
				body: "An unknown error occurred",
				type: TYPE.ERROR,
				channel: channelName,
			});
			useHttpEnd(event, { statusCode: 400, body: "No IP found" }, 400);
		}
		if (!callBackIpWhitelist.includes(ip.toString())) {
			log.warn(`IP ${ip} is not whitelisted`);
		}
	}

	if (callback.ResultCode === 0) {
		const transactionCode = callback.CallbackMetadata.Item.find(
			(item) => item.Name === "MpesaReceiptNumber"
		)?.Value;
		const amount = callback.CallbackMetadata.Item.find((item) => item.Name === "Amount")?.Value;
		const date = callback.CallbackMetadata.Item.find((item) => item.Name === "TransactionDate")?.Value;
		const phoneNumber = callback.CallbackMetadata.Item.find((item) => item.Name === "PhoneNumber")?.Value;

		if (!transactionCode || !amount || !date || !phoneNumber) {
			log.error(`Failed to process payment: ${callback.ResultDesc}`);
			global.channels?.publish(channelName, {
				statusCode: 422,
				body: "Unable to process M-Pesa request",
				type: TYPE.ERROR,
				channel: channelName,
			});
			global.channels!.getChannel(channelName)?.terminate();
			throw createError({
				message: "Failed to process payment",
			});
		}

		const payment = await insertPayment(+amount, transactionCode.toString(), phoneNumber.toString()).catch(
			(e) => e as Error
		);
		if (!payment || payment instanceof Error) {
			log.error(`Failed to insert payment: ${payment?.message} \t code: ${transactionCode}`);
			global.channels?.publish(channelName, {
				statusCode: 500,
				body: "Failed to process payment",
				type: TYPE.ERROR,
				channel: channelName,
			});
			global.channels!.getChannel(channelName)?.terminate();
			throw createError({
				message: "Failed to process payment",
			});
		}

		const { form_meta: form, callback: funcall } = global.formPaymentProcessingQueue?.get(channelName) || {};
		if (form) {
			await insertFormPayment({
				formUlid: form.ulid,
				paymentUlid: payment.ulid,
			}).catch((e) => {
				log.error(`Failed to insert form payment: ${e.message}`);
				global.channels!.publish(channelName, {
					statusCode: 500,
					body: "Failed to process payment",
					type: TYPE.ERROR,
					channel: channelName,
				});
				global.channels!.getChannel(channelName)?.clients.forEach((client) => {
					client.close();
				});
				global.channels?.deleteChannel(channelName);
				useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500);
			});
			try {
				funcall?.(payment);
			} catch (e) {
				log.error(e);
				log.warn("Error on callback", funcall);
			}
		} else {
			log.warn(
				`No form found for CheckoutRequestID ${callback.CheckoutRequestID} and MerchantRequestID ${callback.MerchantRequestID}`
			);
			global.channels?.publish(channelName, {
				statusCode: 404,
				body: "Form not found",
				type: TYPE.ERROR,
				channel: channelName,
			});
			global.channels!.getChannel(channelName)?.terminate();
		}
	} else {
		log.error(`Failed to process payment: ${callback.ResultDesc}`);
		global.channels?.publish(channelName, {
			statusCode: 422,
			body: `Failed to process payment: ${callback.ResultDesc}`,
			type: TYPE.ERROR,
			channel: channelName,
		});
		global.channels!.getChannel(channelName)?.terminate();
		return;
	}

	global.channels?.publish(channelName, { statusCode: 200, body: "OK", type: TYPE.SUCCESS, channel: channelName });
	global.channels!.getChannel(channelName)?.terminate();
	log.success(
		"Payment processed successfully Ref: " +
			callback.CallbackMetadata.Item.find((item) => item.Name === "MpesaReceiptNumber")?.Value
	);
	return "OK";
});
