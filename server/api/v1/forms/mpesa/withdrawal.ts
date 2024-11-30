import {insertWithdrawal} from "~~/server/api/v1/forms/mpesa/utils/queries";

export default defineEventHandler(async event => {
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
})