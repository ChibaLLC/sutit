import {deleteUser} from "~~/server/api/v1/users/utils/queries";

export default defineEventHandler(async event => {
    const response = {} as APIResponse
    const [details, error] = await useAuth(event)
    if (error || !details) {
        response.statusCode = Status.internalServerError
        response.body = error
        return useHttpEnd(event, response, Status.internalServerError)
    }

    const result = await deleteUser(details.user.ulid).catch(e => e as Error)
    if (result instanceof Error) {
        return useHttpEnd(event, { statusCode: 500, body: result.message || "Error On User Delete" })
    }

    response.statusCode = 200
    response.body = "success"

    return response
})