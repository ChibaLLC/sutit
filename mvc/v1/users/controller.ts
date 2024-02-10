import {Status, type APIResponse} from "~/types"
import {getUserByEmail, getUserByToken, deleteUser} from "./queries"

const router = createRouter()

router.get("/get", defineEventHandler(async event => {
    const response = {} as APIResponse
    const token = getQuery(event).token
    const email = getQuery(event).email
    if ((!token || !email) || (token && email)) {
        response.statusCode = Status.badRequest
        response.body = "Bad request make sure you pass at one of the following in the query: token or email"
        return await useHttpEnd(event, response)
    }

    let user = null
    if (token) user = await getUserByToken(token as string).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return null
    })
    if (email) user = await getUserByEmail(email as string).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return null
    })
    if (!user) return {
        statusCode: Status.notFound,
        body: "User not found"
    }

    response.statusCode = Status.success
    response.body = {
        email: user.email,
        name: user.name
    }
    return response
}))

router.delete("/", defineEventHandler(async (event) => {
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

export default useController("v1", "users", router)