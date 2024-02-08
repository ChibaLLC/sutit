import { Status, type APIResponse } from "~/types"
import { getUserByEmail, getUserByToken } from "./queries"

const router = createRouter()

router.get("/email/:email", defineEventHandler(async event => {
    const response = {} as APIResponse
    const email = event.context.params?.email as string
    if (!email) {
        response.statusCode = Status.badRequest
        response.body = "Email is required"
        return await useHttpResponse(event, response)
    }

    const user = await getUserByEmail(email).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return null
    })
    if (!user) return

    response.statusCode = Status.success
    response.body = {
        email: user.email,
        name: user.name
    }
    return response
}))

router.get("/token/:token", defineEventHandler(async event => {
    const response = {} as APIResponse
    const token = event.context.params?.token as string
    if (!token) {
        response.statusCode = Status.badRequest
        response.body = "Token is required"
        return await useHttpResponse(event, response)
    }

    const user = await getUserByToken(token).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return null
    })
    if (!user) return

    response.statusCode = Status.success
    response.body = {
        email: user.email,
        name: user.name
    }
    return response
}))

export default useController("users", router)