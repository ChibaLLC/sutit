import {type APIResponse, Status} from "~/types";
import {authenticate, revokeToken} from "./queries";
import {createUser} from "~/mvc/v1/users/queries";

const router = createRouter()

router.post("/signup", defineEventHandler(async event => {
    const response = {} as APIResponse
    const data = await readBody(event) as { name: string, password: string, email: string }

    await createUser(data).catch(async err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message
        }, Status.internalServerError)
    })

    const token = await authenticate({email: data.email, password: data.password}).catch(async (err: Error) => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
    })

    response.statusCode = Status.success
    response.body = token
    return await useHttpResponse(event, response)
}))

router.post("/login", defineEventHandler(async event => {
    const response = {} as APIResponse
    const data = await readBody(event) as { password: string, email: string }

    const token = await authenticate({email: data.email, password: data.password})
        .catch((err: Error) => {
            useHttpEnd(event, {
                body: err.message,
                statusCode: Status.internalServerError
            }, Status.internalServerError)
        })

    response.statusCode = Status.success
    response.body = token
    return await useHttpResponse(event, response)
}))

router.post("/logout", defineEventHandler(async event => {
    const bearer = getHeader(event, 'bearer')
    const response = {} as APIResponse

    if (!bearer) return useHttpEnd(event, {
        body: "No bearer token provided",
        statusCode: Status.unauthorized
    }, Status.unauthorized)

    await revokeToken(bearer).catch(async (err: Error) => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
    })

    response.statusCode = Status.success
    response.body = "Logged out"
    return await useHttpResponse(event, response)
}))

export default useController("auth", router)