import {type APIResponse, Status} from "~/types";
import {getFormResponses} from "~/mvc/v1/forms/queries";

export default defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const details = await useAuth(event)
    if (!details) return

    const submissions = await getFormResponses(formUlid).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while getting form submissions"
        } as APIResponse, Status.internalServerError)

        return null
    })

    if (!submissions) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Submissions not found"
    }, Status.notFound)

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = submissions

    return response
})