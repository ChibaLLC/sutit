import {getUserByEmail} from "~~/server/api/v1/forms/users/utils/queries";
import {createToken} from "~~/server/api/v1/auth/utils/queries";

defineEventHandler(async event => {
    const response = {} as APIResponse
    const { email, origin, redirect } = getQuery(event)
    if (!email || !origin) {
        response.statusCode = Status.badRequest
        response.body = "Email and Origin are required"
        return response
    }
    const user = await getUserByEmail(email.toString()).catch(err => err as Error)
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

    const token = await createToken({ userUlid: user.ulid, email: user.email }).catch(err => err as Error)
    if (token instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = token.message
        return response
    }

    await mailResetPasswordLink(email.toString(), origin.toString(), token, redirect?.toString())
    response.statusCode = Status.success
    response.body = "Reset link sent"
    return response
})