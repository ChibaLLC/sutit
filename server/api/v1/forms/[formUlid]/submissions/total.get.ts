import {getFormByUlid, getFormPaymentsSum} from "~~/server/api/v1/forms/utils/queries";

export default defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error || !details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })

    const form = await getFormByUlid(formUlid).catch(err => err as Error)
    if (form instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: form?.message || "Unknown error while getting form"
    } as APIResponse<string>, Status.internalServerError)
    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    if (form.forms.userUlid !== details.user.ulid) return useHttpEnd(event, {
        statusCode: Status.forbidden,
        body: "Unauthorized"
    }, Status.forbidden)

    const total = await getFormPaymentsSum(formUlid).catch(err => err as Error)
    if (total instanceof Error) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: total?.message || "Unknown error while getting form payments total"
    } as APIResponse<string>, Status.internalServerError)

    const response = {} as APIResponse<number>
    response.statusCode = Status.success
    response.body = total

    return response
})