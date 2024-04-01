import {type APIResponse, Status} from "~/types";
import {insertData} from "~/server/mvc/v1/forms/queries";

export default defineEventHandler(async event => {
    const formId = event.context.params?.formId
    if (!formId) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })
    const data = await readBody(event) as {
        fields: Array<{ id: number, value: string }>
    }

    await insertData(details?.user?.id, +formId, data).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while submitting form"
        } as APIResponse, Status.internalServerError)
    })

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = "Form submitted"

    return response
})