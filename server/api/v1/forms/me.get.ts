import {type APIResponse, Status} from "~/types";
import {getFormsByUser} from "~/mvc/v1/forms/queries";

export default defineEventHandler(async event => {
    const response = {} as APIResponse
    const [details, error] = await useAuth(event)
    if (!details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    }, Status.unauthorized)

    const forms = await getFormsByUser(details.user.id).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return []
    })

    response.statusCode = Status.success
    response.body = forms
    return response
})