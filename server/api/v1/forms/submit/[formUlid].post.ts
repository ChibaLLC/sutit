import {type APIResponse, Status} from "~/types";
import {insertData} from "~/server/mvc/forms/queries";

export default defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })
    const data = await readBody(event) as {
        fields: Record<number, any>
    }

    const fieldsMap = new Map<number, any>()
    for (const [id, value] of Object.entries(data.fields)) {
        fieldsMap.set(Number(id), value)
    }

    await insertData(details!.user.id, formUlid, fieldsMap).catch(err => {
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