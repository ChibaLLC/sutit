import { completeFormPayment } from "~~/server/services/payment.service";
import { StkCallbackHook } from "~~/shared/types";

export default defineEventHandler(async (event) => {
	try {
		const hook = (await readBody(event)) as StkCallbackHook;
		const callback = hook.Body.stkCallback;
		if (!callback) {
			throw createError({
				statusCode: 400,
				message: "No callback found",
			});
		}

		await completeFormPayment(hook);
	} catch (e: any) {
		console.log("Unable To Process Payment", e.message);
	}
});
