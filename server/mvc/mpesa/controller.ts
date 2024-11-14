import { insertFormPayment, insertPayment } from "../../mvc/forms/queries";
import { H3Event } from "h3"
import { insertWithdrawal } from "./queries";

const router = createRouter()

function _getRequestIP(event: H3Event): string {
    let ip = getRequestIP(event)?.toString()

    if (!ip) {
        ip = (event.node.req.headers['x-forwarded-for'] || event.node.req.connection.remoteAddress)?.toString()
    }

    return ip || ""
}

router.use('/forms/callback/stk', defineEventHandler(async event => {
    const hook = await readBody(event) as StkCallbackHook
    const callback = hook.Body.stkCallback
    if (!callback) {
        return useHttpEnd(event, { statusCode: 400, body: "No callback found" }, 400)
    }

    const channelName = createChannelName(callback.CheckoutRequestID, callback.MerchantRequestID)
    if (isProduction) {
        const ip = _getRequestIP(event)
        if (!ip) {
            log.error("No IP found")
            global.channels?.publish(channelName, { statusCode: Status.badRequest, body: "An unknown error occurred", type: TYPE.ERROR, channel: channelName })
            useHttpEnd(event, { statusCode: 400, body: "No IP found" }, 400)
        }
        if (!callBackIpWhitelist.includes(ip.toString())) {
            log.warn(`IP ${ip} is not whitelisted`)
        }
    }


    if (callback.ResultCode === 0) {
        const transactionCode = callback.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber")?.Value
        const amount = callback.CallbackMetadata.Item.find(item => item.Name === "Amount")?.Value
        const date = callback.CallbackMetadata.Item.find(item => item.Name === "TransactionDate")?.Value
        const phoneNumber = callback.CallbackMetadata.Item.find(item => item.Name === "PhoneNumber")?.Value

        if (!transactionCode || !amount || !date || !phoneNumber) {
            log.error(`Failed to process payment: ${callback.ResultDesc}`)
            global.channels?.publish(channelName, { statusCode: Status.unprocessableEntity, body: "Unable to process M-Pesa request", type: TYPE.ERROR, channel: channelName })
            global.channels!.getChannel(channelName)?.clients.forEach(client => { client.close() })
            return useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500)
        }

        const ulid = await insertPayment(+amount, transactionCode.toString(), phoneNumber.toString()).catch(e => e as Error)
        if (ulid instanceof Error) {
            log.error(`Failed to insert payment: ${ulid.message} \t code: ${transactionCode}`)
            global.channels?.publish(channelName, { statusCode: Status.internalServerError, body: "Failed to process payment", type: TYPE.ERROR, channel: channelName })
            global.channels!.getChannel(channelName)?.clients.forEach(client => { client.close() })
            return useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500)
        }

        const { form, callback: funcall } = global.formPaymentProcessingQueue?.get(channelName) || {}
        if (form) {
            await insertFormPayment({
                formUlid: form.ulid,
                paymentUlid: ulid
            }).catch(e => {
                log.error(`Failed to insert form payment: ${e.message}`)
                global.channels!.publish(channelName, { statusCode: Status.internalServerError, body: "Failed to process payment", type: TYPE.ERROR, channel: channelName })
                global.channels!.getChannel(channelName)?.clients.forEach(client => { client.close() })
                useHttpEnd(event, { statusCode: 500, body: "Failed to process payment" }, 500)
            })
            try {
                funcall?.(ulid)
            } catch (e) {
                log.error(e)
                log.warn("Error on callback", funcall)
            }
        } else {
            log.warn(`No form found for CheckoutRequestID ${callback.CheckoutRequestID} and MerchantRequestID ${callback.MerchantRequestID}`)
            global.channels?.publish(channelName, { statusCode: Status.notFound, body: "Form not found", type: TYPE.ERROR, channel: channelName })
            global.channels!.getChannel(channelName)?.clients.forEach(client => { client.close() })
        }
    } else {
        log.error(`Failed to process payment: ${callback.ResultDesc}`)
        global.channels?.publish(channelName, { statusCode: Status.unprocessableEntity, body: `Failed to process payment: ${callback.ResultDesc}`, type: TYPE.ERROR, channel: channelName })
        global.channels!.getChannel(channelName)?.clients.forEach(client => { client.close() })
        return useHttpEnd(event, null, 204)
    }

    global.channels?.publish(channelName, { statusCode: Status.success, body: "OK", type: TYPE.SUCCESS, channel: channelName })
    global.channels?.getChannel(channelName)?.clients.forEach(client => { client.close() })
    log.success("Payment processed successfully Ref: " + callback.CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber")?.Value)
    return useHttpEnd(event, { statusCode: Status.success, body: "OK" })
}))


router.use('/forms/callback/withdrawal', defineEventHandler(async event => {
    const body = await readBody(event) as B2cCallback
    if (!body) {
        return useHttpEnd(event, { statusCode: 400, body: "No callback found" }, 400)
    }

    const { Result } = body
    if (!Result) {
        return useHttpEnd(event, { statusCode: 400, body: "No callback found" }, 400)
    }

    const { ResultParameters, ResultType, OriginatorConversationID, ConversationID, TransactionID, ReferenceData } = Result
    if (ResultType !== 0) {
        log.error(`Failed to process withdrawal: ${Result.ResultDesc}`)
        return useHttpEnd(event, { statusCode: 500, body: "Failed to process withdrawal" }, 200)
    }

    const transactionCode = ResultParameters.ResultParameter.find(param => param.Key === "TransactionReceipt")?.Value
    const amount = ResultParameters.ResultParameter.find(param => param.Key === "Amount")?.Value

    if (!transactionCode || !amount) {
        log.error(`Failed to process withdrawal: ${Result.ResultDesc}`)
        return useHttpEnd(event, { statusCode: 500, body: "Failed to process withdrawal" }, 200)
    }

    const ulid = await insertWithdrawal(+amount, transactionCode.toString()).catch(e => e as Error)


    return useHttpEnd(event, { statusCode: 201, body: "OK" })
}))

router.use("/forms/timeout/withdrawal", defineEventHandler(async event => {
    log.error("Withdrawal timed out", await readBody(event))
}))

export default useController('mpesa', router)