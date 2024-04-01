import {type APIResponse, Status} from "~/types";
import {revokeAuthToken} from "~/mvc/v1/auth/methods";
import {authenticate} from "~/mvc/v1/auth/queries";

export default defineEventHandler(async event => {
    const response = {} as APIResponse
    const data = await readBody(event) as { password: string, email: string }

    const revoked = await revokeAuthToken(event).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return false
    })
    if (!revoked) return

    const token = await authenticate({email: data.email, password: data.password})
        .catch((err: Error) => {
            useHttpEnd(event, {
                body: err.message,
                statusCode: Status.unauthorized
            }, Status.unauthorized)
            return false
        })
    if (!token) return

    response.statusCode = Status.success
    response.body = token
    return response
})