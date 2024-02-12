import {Status, type APIResponse} from "~/types"
import {getUserByEmail, getUserByToken, deleteUser} from "./queries"

const router = createRouter()

router.get("/me", defineEventHandler(async event => {
    const response = {} as APIResponse
    const details = await useAuth(event).catch(e => e as Error)
    if (details instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = details.message || "Error Occurred When Accessing DB"
        return useHttpEnd(event, response, Status.internalServerError)
    }
    if (!details) return useHttpEnd(event, {statusCode: 404, body: "Not Found"}, 404)

    response.statusCode = 200
    response.body = {
        email: details.user.email,
        name: details.user.name
    }

    return response
}))

router.delete("/me", defineEventHandler(async (event) => {
    const response = {} as APIResponse
    const details = await useAuth(event).catch(e => e as Error)
    if (details instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = details.message || "Error Occurred When Accessing DB"
        return useHttpEnd(event, response, Status.internalServerError)
    }
    if (!details) return useHttpEnd(event, {statusCode: 404, body: "Not Found"}, 404)

    const result = await deleteUser(details.user.id).catch(e => e as Error)
    if (result instanceof Error) {
        return useHttpEnd(event, {statusCode: 500, body: result.message || "Error On User Delete"})
    }

    response.statusCode = 200
    response.body = "success"

    return response
}))

export default useController("users", router)