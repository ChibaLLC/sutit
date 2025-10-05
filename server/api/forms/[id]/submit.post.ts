import { auth } from "~~/server/lib/auth";
import { processFormPayment } from "~~/server/services/payment.service";
import { submitForm } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
	try {
		const formId = getRouterParam(event, "id");
		if (!formId) {
			throw createError({
				message: "Not Found",
				statusCode: 404,
			});
		}
		const session = await auth.api.getSession({
			headers: event.headers,
		});
		const body = await readBody(event);
		let submission = await submitForm(formId, body, session?.user.id);
		if (submission.submmission.pricePaid == 0) {
			return {
				data: {
					...submission,
				},
				message: "submitted successfully",
			};
		}
		const pay = await processFormPayment(
			submission.form,
			submission.submmission,
		);
		if (
			submission.metadata.paymentData.phoneNumber &&
			submission.form.afterSubmissionMessage
		) {
			await sendTextSmsTiara({
				phone: submission.metadata.paymentData.phoneNumber as string,
				message: submission.form.afterSubmissionMessage,
			});
		}

		return {
			data: {
				...submission,
				...pay,
			},
			message: "Stk Push Has been sent to your phone Pay",
		};
	} catch (e) {
		throw createError({
			statusCode: 500,
			message: e.message || "An error occurred!!",
		});
	}
});
