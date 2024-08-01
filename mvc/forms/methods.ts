import type { Drizzle } from "~/db/types";
import { call_stk } from "~/mvc/mpesa/methods";
import { createChannelName } from "~/server/utils/socket";

declare global {
    var formPaymentProcessingQueue: Map<string, {
        form: Drizzle.Form.select,
        callback?: (...args: any[]) => any
    }>
}

export async function processFormPayments(form: Drizzle.Form.select, details: { phone: string; amount: number }, accountNumber: string, callback?: (...args: any[]) => any) {
    details.phone = `254${details.phone.slice(-9)}`
    const result = await makeSTKPush(details.phone, form.formName, details.amount, accountNumber)
    const channel = createChannelName(result.MerchantRequestID, result.CheckoutRequestID)
    if (!global.formPaymentProcessingQueue) global.formPaymentProcessingQueue = new Map()
    global.formPaymentProcessingQueue.set(channel, { form, callback })
    return {
        statusCode: 201,
        body: {
            merchantRequestID: result.MerchantRequestID,
            checkoutRequestID: result.CheckoutRequestID
        }
    }
}

async function makeSTKPush(phone: string, pay_for: string, amount: number, accountNumber: string) {
    return await call_stk(+phone, amount, `Payment for ${pay_for} form`, accountNumber)
}