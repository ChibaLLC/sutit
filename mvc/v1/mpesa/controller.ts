import { callBackIpWhitelist as whitelist, type StkCallback } from "~/types"
import { insertFormPayment } from "~/mvc/v1/forms/queries";

const router = createRouter()

router.use("/forms/callback", defineEventHandler(async (event) => {
    const body = await readBody(event)
    log.info("Mpesa callback received", JSON.stringify(body, null, 2))
    const ip = getRequestIP(event)
    if (!ip) return useHttpEnd(event, { statusCode: 400, body: "No IP found" }, 400)
    if (!whitelist.includes(ip)) {
        log.warn(`IP ${ip} is not whitelisted`)
        return useHttpEnd(event, { statusCode: 403, body: "Forbidden" }, 403)
    }

    const callback = await readBody(event) as StkCallback
    if (!callback) return useHttpEnd(event, { statusCode: 400, body: "No body found" }, 400)

    const queue = globalThis.paymentProcessingQueue
    if (!queue) throw new Error("Queue not found")

    const stream = queue.find(item => (item.mpesa.checkoutRequestID === callback.CheckoutRequestID) && (item.mpesa.merchantRequestID === callback.MerchantRequestID))
    if (!stream) {
        log.error(`Stream not found for CheckoutRequestID ${callback.CheckoutRequestID} and MerchantRequestID ${callback.MerchantRequestID}`)
        return useHttpEnd(event, { statusCode: 404, body: "Stream not found" }, 404)
    }

    if (callback.ResultCode === 0) {
        const transactionCode = callback.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber")?.Value
        const amount = callback.CallbackMetadata.Item.find(item => item.Name === "Amount")?.Value
        const date = callback.CallbackMetadata.Item.find(item => item.Name === "TransactionDate")?.Value
        const phoneNumber = callback.CallbackMetadata.Item.find(item => item.Name === "PhoneNumber")?.Value

        if (!transactionCode || !amount || !date || !phoneNumber) {
            log.error(`Failed to process payment: ${callback.ResultDesc}`)
            return useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500)
        }

        insertFormPayment({
            form_id: stream.form.form.id,
            amount: +amount,
            referenceCode: transactionCode.toString(),
            phone: phoneNumber.toString()
        }).then(() => {
            stream.stream.send({
                statusCode: 200,
                body: "OK"
            })
            stream.stream.end()
            globalThis.paymentProcessingQueue = queue.filter(item => (item.mpesa.checkoutRequestID !== callback.CheckoutRequestID) && (item.mpesa.merchantRequestID !== callback.MerchantRequestID))
        }).catch(err => {
            log.error(`Failed to process payment: ${err.message}`)
            return useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500)
        })
    } else {
        log.error(`Failed to process payment: ${callback.ResultDesc}`)
        return useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500)
    }

    log.info(`Payment processed successfully: ${callback.ResultDesc}`)
    return useHttpEnd(event, { statusCode: 200, body: "OK" }, 200)
}))

export default useController("mpesa", router)