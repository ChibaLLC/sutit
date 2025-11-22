import { findPaymentWithCheckoutId } from "~~/server/services/payment.service";

export default defineEventHandler(async (event) => {
	const checkoutId = getRouterParam(event, "checkoutId");
	if (!checkoutId) {
		return { success: false, message: "Missing checkoutId", data: null };
	}

	const payment = await findPaymentWithCheckoutId({
		checkoutId: checkoutId,
	});
	if (!payment) {
		return {
			success: false,
			message: "Payment Not Found",
			data: null,
		};
	}
	return {
		success: true,
		data: payment,
		message: "Payment Found",
	};
});
