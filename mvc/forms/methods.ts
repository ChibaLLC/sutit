import type {H3Event} from "h3";
import type {Drizzle} from "~/db/types";
import {Stream} from "~/server/utils/http";
import {call_stk} from "~/mvc/mpesa/methods";


declare global {
    var paymentProcessingQueue: Array<{
        stream: Stream,
        mpesa: { merchantRequestID: string, checkoutRequestID: string },
        form: Drizzle.Form.select
    }>
}

export async function processFormPayments(event: H3Event, form: Drizzle.Form.select, details: { phone: string; identity: string; amount: number }, accountNumber: string) {
    const stream = await useSSE(event, details.identity)
    if (!globalThis.paymentProcessingQueue) globalThis.paymentProcessingQueue = []
    
    details.phone = `254${details.phone.slice(-9)}`

    await makeSTKPush(details.phone, form.formName, details.amount, accountNumber)
        .then(async (result) => {
            if (!result) {
                stream.send({
                    statusCode: 500,
                    body: "Failed to initiate payment"
                })
                stream.end()
            } else {
                globalThis.paymentProcessingQueue.push({
                    stream: stream,
                    mpesa: {
                        merchantRequestID: result.MerchantRequestID,
                        checkoutRequestID: result.CheckoutRequestID
                    },
                    form: form
                })
            }
        })
}

async function makeSTKPush(phone: string, pay_for: string, amount: number, accountNumber: string) {
    return await call_stk(+phone, amount, `Payment for ${pay_for} form`, accountNumber)
        .catch(err => {
            console.error(err)
            return null
        })
}