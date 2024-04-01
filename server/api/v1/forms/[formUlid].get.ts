import {type APIResponse, Status} from "~/types";
import {getFormByUlid} from "~/server/mvc/v1/forms/queries";

export default defineEventHandler(async event => {
    const formUuid = getRouterParam(event, "formUlid")
    if (!formUuid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const form = await getFormByUlid(formUuid).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while getting form"
        } as APIResponse, Status.internalServerError)
    })

    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = form

    return response
})