import { Mpesa } from "daraja.js";
import { Form, StkCallbackHook, Submission } from "~~/shared/types";
import { formPayments, payments } from "../db/schema";
import db from "../db";
import { eq } from "drizzle-orm";
import { callStkPush } from "./mpesa.service";
const createPayment = async (
	form: Form,
	submission: Submission,
	mpesa: { checkoutId: string; merchantId: string; phone: string },
) => {
	return await db.transaction(async (tx) => {
		const [payment] = await tx
			.insert(payments)
			.values({
				userId: submission.submitterId,
				merchantId: mpesa.merchantId,
				checkoutId: mpesa.checkoutId,
				phoneNumber: mpesa.phone,
				amount: submission.pricePaid,
			})
			.returning();
		const [formPayment] = await tx
			.insert(formPayments)
			.values({
				formId: form.id,
				paymentId: payment.id,
				submissionId: submission.id,
			})
			.returning();
		return {
			payment: payment,
			formPayment: formPayment,
		};
	});
};

export const processFormPayment = async (
	form: Form,
	submission: Submission,
) => {
	try {
		if (submission.metadata && submission.metadata.paymentData.phoneNumber) {
			let paymentData = {
				phone: submission.metadata.paymentData.phoneNumber,
				amount: submission.pricePaid,
				accountNumber: form.title,
				description: `Payment for ${form.title} `,
			};
			let result = await callStkPush(
				+paymentData.phone,
				paymentData.amount!,
				paymentData.description,
				paymentData.accountNumber,
			);
			return await createPayment(form, submission, {
				checkoutId: result.CheckoutRequestID,
				merchantId: result.MerchantRequestID,
				phone: paymentData.phone,
			});
		}
	} catch (e: any) {}
};

export const completeFormPayment = async (data: StkCallbackHook) => {
	const { stkCallback } = data.Body;

	if (stkCallback.ResultCode !== 0) {
		await db
			.update(payments)
			.set({
				status: "failed",
				updatedAt: new Date(),
			})
			.where(eq(payments.checkoutId, stkCallback.CheckoutRequestID));
		return { success: false, message: stkCallback.ResultDesc };
	}

	const meta: Record<string, string | number> = {};
	let receiptNumber: string | undefined;
	let amount: number | undefined;

	if (stkCallback.CallbackMetadata?.Item) {
		for (const item of stkCallback.CallbackMetadata.Item) {
			meta[item.Name] = item.Value;
			if (
				item.Name === "MpesaReceiptNumber" &&
				typeof item.Value === "string"
			) {
				receiptNumber = item.Value;
			}
			if (item.Name === "Amount" && typeof item.Value === "number") {
				amount = item.Value;
			}
		}
	}

	// Update the payment row
	const [updated] = await db
		.update(payments)
		.set({
			status: "completed",
			receiptNumber,
			paidAt: new Date(),
			metadata: meta,
			updatedAt: new Date(),
		})
		.where(eq(payments.checkoutId, stkCallback.CheckoutRequestID))
		.returning();

	return { success: true, payment: updated };
};

export const findPaymentWithCheckoutId = async (data: {
	checkoutId: string;
}) => {
	const payment = await db.query.payments.findFirst({
		where: eq(payments.checkoutId, data.checkoutId),
	});
	if (!payment) {
		throw Error("Payment Not Found");
	}
	return payment;
};
