import {type APIResponse, Status} from "~/types";
import {revokeAuthToken} from "~/mvc/v1/auth/methods";

export default defineEventHandler(async event => {
    const response = {} as APIResponse
    const revoke = await revokeAuthToken(event).catch(err => {
        useHttpEnd(event, {
            body: err.message || err,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return false
    })
    if (!revoke) return

    response.statusCode = Status.success
    response.body = "Logged out"
    return response
})