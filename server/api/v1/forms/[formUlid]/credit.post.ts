import {getFormByUlid} from "../utils/queries";
import {withdrawFunds} from "../utils";

export default defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const sendToPayload = await readBody(event) as CreditMethod
    if (!sendToPayload) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No phone number provided"
    }, Status.badRequest)

    const {user} = await useAuth(event)

    const form = await getFormByUlid(formUlid).catch(err => err as Error)
    if (form instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: form?.message || "Unknown error while getting form"
    } as APIResponse<string>, Status.internalServerError)
    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    if (form.form_meta?.userUlid !== user.ulid) return useHttpEnd(event, {
        statusCode: Status.forbidden,
        body: "Unauthorized"
    }, Status.forbidden)

    const result = await withdrawFunds({ formUlid, creditMethod: sendToPayload, reason: "User Initiated Form Withdrawal", requester: user.ulid }).catch(err => err as Error)
    if (result instanceof Error) {
        console.error(result)
        console.trace(result)
        return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: result?.message || "Unknown error while withdrawing funds"
        } as APIResponse<string>, Status.internalServerError)
    }

    const response = {} as APIResponse<string>
    response.statusCode = Status.success
    response.body = "Funds withdrawn"

    return response
})