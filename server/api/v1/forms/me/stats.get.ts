import {getStats} from "../utils";

export default defineEventHandler(async event => {
    const response = {} as APIResponse<{ forms: number, responses: number, earnings: number }>
    const [details, error] = await useAuth(event)
    if (!details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    }, Status.unauthorized)

    const stats = await getStats(details.user.ulid).catch(err => err as Error)
    if (stats instanceof Error) {
        return useHttpEnd(event, {
            body: stats.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
    }

    response.statusCode = Status.success
    response.body = stats

    return response
})