import {getUserByEmail} from "~~/server/api/v1/forms/users/utils/queries";
import {resetPassword} from "~~/server/api/v1/auth/utils";
import {authenticate} from "~~/server/api/v1/auth/utils/queries";

export default defineEventHandler(async event => {
    const query = getQuery(event)
    const email = query.email?.toString()
    const token = query.token?.toString()
    const { password } = await readBody(event) as { password: string, origin: string }
    const response = {} as APIResponse

    if (!email || !token || !password) {
        response.statusCode = Status.badRequest
        response.body = "Email, token and password are required"
        return response
    }

    const user = await getUserByEmail(email).catch(err => err as Error)
    if (user instanceof Error) {
        response.statusCode = Status.notFound
        response.body = user.message
        return response
    }
    if (!user) {
        response.statusCode = Status.notFound
        response.body = "User not found"
        return response
    }

    const reset = await resetPassword({ user, token, password }).catch(err => err as Error)
    if (reset instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = reset.message
        return response
    }

    const _token = await authenticate({ email, password }).catch(err => err as Error)
    if (_token instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = _token.message
        return response
    }
    if (!_token) {
        response.statusCode = Status.internalServerError
        response.body = "Token not generated"
        return response
    }

    response.statusCode = Status.success
    response.body = _token
    return response
})