import {githubAuth} from "~~/server/api/v1/auth/utils";

export default defineEventHandler(async event => {
    const response = {} as APIResponse
    const { code } = getQuery(event)
    if (!code) {
        response.statusCode = Status.badRequest
        response.body = "Code is required"
        return response
    }
    const token = await githubAuth(code.toString()).catch(err => err as Error)
    if (token instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = token.message
        return response
    }

    setCookie(event, "auth", token)
    return sendRedirect(event, `/dashboard`)
})