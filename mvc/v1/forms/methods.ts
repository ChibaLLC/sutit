import type {H3Event} from "h3";
import type {Drizzle} from "~/db/types";
import {Stream} from "~/server/utils/http";
import {call_stk} from "~/mvc/v1/mpesa/methods";


declare global {
    var paymentProcessingQueue: Array<{
        stream: Stream,
        mpesa: { merchantRequestID: string, checkoutRequestID: string },
        form: {
            form: Drizzle.Form.select,
            fields?: Drizzle.FormFields.select[],
            paymentDetails: Drizzle.PaymentDetails.select
        }
    }>
}

type Form = {
    form: Drizzle.Form.select,
    fields?: Drizzle.FormFields.select[],
    paymentDetails: Drizzle.PaymentDetails.select
}

export async function processFormPayments(event: H3Event, form: Form, details: { phone: string; identity: string; }) {
    const stream = await useSSE(event, details.identity)
    if (!globalThis.paymentProcessingQueue) globalThis.paymentProcessingQueue = []

    await makeSTKPush(details.phone, form)
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

async function makeSTKPush(phone: string, form: Form) {
    const response = await call_stk(parseInt(phone), form.paymentDetails.amount, `Payment for ${form.form.formName} form`)
        .catch(err => {
            console.error(err)
            return null
        })
    if (!response) return null
    return response
}