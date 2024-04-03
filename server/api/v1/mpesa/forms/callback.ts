import { callBackIpWhitelist as whitelist, type StkCallback, type StkCallbackHook, Status } from "~/types";
import { insertFormPayment } from "~/server/mvc/v1/forms/queries";

export default defineEventHandler(async event => {
    // TODO: Uncomment for production, also getRequestIp not working
    // const ip = getRequestIP(event)
    // if (!ip) return useHttpEnd(event, { statusCode: 400, body: "No IP found" }, 400)
    // if (!whitelist.includes(ip)) {
    //     log.warn(`IP ${ip} is not whitelisted`)
    //     return useHttpEnd(event, { statusCode: 403, body: "Forbidden" }, 403)
    // }

    const hook = await readBody(event) as StkCallbackHook
    const callback = hook.Body.stkCallback
    log.info(callback)

    const queue = globalThis.paymentProcessingQueue
    const client = queue.find(item => (item.mpesa.checkoutRequestID === callback.CheckoutRequestID) && (item.mpesa.merchantRequestID === callback.MerchantRequestID))
    if (!queue) throw new Error("Queue not found")

    if (!client) {
        log.error(`Stream not found for CheckoutRequestID ${callback.CheckoutRequestID} and MerchantRequestID ${callback.MerchantRequestID}`)
        // TODO: Handle payment even if client is offline, not end
        return useHttpEnd(event, null, 204)
    }
    if (!callback) {
        client?.stream.send({ statusCode: Status.badRequest, body: "No callback found" })
        return useHttpEnd(event, { statusCode: 400, body: "No callback found" }, 400)
    }

    if (callback.ResultCode === 0) {
        const transactionCode = callback.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber")?.Value
        const amount = callback.CallbackMetadata.Item.find(item => item.Name === "Amount")?.Value
        const date = callback.CallbackMetadata.Item.find(item => item.Name === "TransactionDate")?.Value
        const phoneNumber = callback.CallbackMetadata.Item.find(item => item.Name === "PhoneNumber")?.Value

        if (!transactionCode || !amount || !date || !phoneNumber) {
            log.error(`Failed to process payment: ${callback.ResultDesc}`)
            client.stream.send({ statusCode: Status.unprocessableEntity, body: "Unable to process M-Pesa request" })
            return useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500)
        }

        await insertFormPayment({ form_id: client.form.form.id, amount: +amount, referenceCode: transactionCode.toString(), phone: phoneNumber.toString() }).catch(e => {
            log.error(`Failed to insert form payment: ${e.message}`)
            client.stream.send({ statusCode: Status.internalServerError, body: "Failed to process payment" })
            return useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500)
        })

        globalThis.paymentProcessingQueue = queue.filter(item => (item.mpesa.checkoutRequestID !== callback.CheckoutRequestID) && (item.mpesa.merchantRequestID !== callback.MerchantRequestID))
    } else {
        log.error(`Failed to process payment: ${callback.ResultDesc}`)
        client.stream.send({ statusCode: Status.unprocessableEntity, body: "Unable to process M-Pesa request" })
        return useHttpEnd(event, null, 204)
    }

    client.stream.send({ statusCode: Status.success, body: "OK" })
    client.stream.end()
    log.info(`Payment processed successfully: ${callback.ResultDesc}`)
    return useHttpEnd(event, { statusCode: 200, body: "OK" }, 200)
})