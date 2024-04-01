import {type APIResponse, Status} from "~/types";
import {getFormResponses} from "~/server/mvc/v1/forms/queries";

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

    const submissions = await getFormResponses(formUlid).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while getting form submissions"
        } as APIResponse, Status.internalServerError)

        return null
    })

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = submissions

    return response
})