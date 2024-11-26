import {googleAuth} from "~~/server/api/v1/auth/utils";

export default defineEventHandler(async event => {
    const response = {} as APIResponse
    const data = await readBody(event) as GoogleCredential
    const token = await googleAuth(data).catch(err => err as Error)
    if (token instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = token.message
        return response
    }

    response.statusCode = Status.success
    response.body = token
    return response
})