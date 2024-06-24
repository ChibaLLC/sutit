import {callBackIpWhitelist as whitelist, Status, type StkCallbackHook} from "~/types";
import {insertFormPayment, insertPayment} from "~/mvc/forms/queries";

const router = createRouter()

router.use('/forms/callback', defineEventHandler(async event => {
    if (isProduction) {
        const ip = getRequestIP(event)
        if (!ip) return useHttpEnd(event, {statusCode: 400, body: "No IP found"}, 400)
        if (!whitelist.includes(ip)) {
            log.warn(`IP ${ip} is not whitelisted`)
        }
    }

    const hook = await readBody(event) as StkCallbackHook

    const callback = hook.Body.stkCallback

    const queue = globalThis.paymentProcessingQueue
    const client = queue.find(item => (item.mpesa.checkoutRequestID === callback.CheckoutRequestID) && (item.mpesa.merchantRequestID === callback.MerchantRequestID))
    if (!queue) throw new Error("Global Processing Queue not found")

    if (!client) {
        log.error(`Stream not found for CheckoutRequestID ${callback.CheckoutRequestID} and MerchantRequestID ${callback.MerchantRequestID}`)
    }
    if (!callback) {
        client?.stream.send({statusCode: Status.badRequest, body: "No callback found"})
        return useHttpEnd(event, {statusCode: 400, body: "No callback found"}, 400)
    }

    if (callback.ResultCode === 0) {
        const transactionCode = callback.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber")?.Value
        const amount = callback.CallbackMetadata.Item.find(item => item.Name === "Amount")?.Value
        const date = callback.CallbackMetadata.Item.find(item => item.Name === "TransactionDate")?.Value
        const phoneNumber = callback.CallbackMetadata.Item.find(item => item.Name === "PhoneNumber")?.Value

        if (!transactionCode || !amount || !date || !phoneNumber) {
            log.error(`Failed to process payment: ${callback.ResultDesc}`)
            client?.stream.send({statusCode: Status.unprocessableEntity, body: "Unable to process M-Pesa request"})
            return useHttpEnd(event, {statusCode: 500, body: "Failed to process payment"}, 500)
        }

        const ulid = await insertPayment(+amount, transactionCode.toString(), phoneNumber.toString()).catch(e => e as Error)
        if (ulid instanceof Error) {
            log.error(`Failed to insert payment: ${ulid.message} \t code: ${transactionCode}`)
            client?.stream.send({statusCode: Status.internalServerError, body: "Failed to process payment"})
            return useHttpEnd(event, {statusCode: 500, body: "Failed to process payment"}, 500)
        }

        if (client?.form) {
            await insertFormPayment({
                formUlid: client.form.ulid,
                paymentUlid: ulid
            }).catch(e => {
                log.error(`Failed to insert form payment: ${e.message}`)
                client?.stream.send({statusCode: Status.internalServerError, body: "Failed to process payment"})
                return useHttpEnd(event, {statusCode: 500, body: "Failed to process payment"}, 500)
            })
        } else {
            log.warn(`No form found for CheckoutRequestID ${callback.CheckoutRequestID} and MerchantRequestID ${callback.MerchantRequestID}`)
        }

        globalThis.paymentProcessingQueue = queue.filter(item => (item.mpesa.checkoutRequestID !== callback.CheckoutRequestID) && (item.mpesa.merchantRequestID !== callback.MerchantRequestID))
    } else {
        log.error(`Failed to process payment: ${callback.ResultDesc}`)
        client?.stream.send({
            statusCode: Status.unprocessableEntity,
            body: `Failed to process payment: ${callback.ResultDesc}`
        })
        return useHttpEnd(event, null, 204)
    }

    client?.stream.send({statusCode: Status.success, body: "OK"})
    client?.stream.end()
    log.success("Payment processed successfully Ref: " + callback.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber")?.Value)
    return useHttpEnd(event, {statusCode: Status.success, body: "OK"}, 200)
}))

export default useController('mpesa', router)