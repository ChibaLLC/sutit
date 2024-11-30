import {getRecentForms} from "~~/server/api/v1/users/utils/queries";

export default defineEventHandler(async event => {
    const response = {} as APIResponse
    const [details, error] = await useAuth(event)
    if (!details || error) {
        response.statusCode = Status.internalServerError
        response.body = error
        return useHttpEnd(event, response, Status.unauthorized)
    }

    const forms = await getRecentForms(details.user.ulid).catch(e => e as Error)
    if (forms instanceof Error) {
        response.statusCode = 500
        response.body = forms.message || "Error On Getting Recent Forms"
        return useHttpEnd(event, response)
    }

    response.statusCode = 200
    response.body = { forms }

    return response
})