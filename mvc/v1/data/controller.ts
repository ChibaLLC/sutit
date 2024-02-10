import {type APIResponse, Status} from "~/types";

const router = createRouter()

router.delete("/user", defineEventHandler(async event => {
    const details = await useAuth(event).catch(e => e as Error)
    if (details instanceof Error) {
        return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: details.message || "Error during user lookup"
        }, Status.internalServerError)
    }
    if (!details) return useHttpEnd(event, null, Status.unauthorized)

    // TODO: Implement data deletion

    return {
        statusCode: Status.success
    } as APIResponse
}))