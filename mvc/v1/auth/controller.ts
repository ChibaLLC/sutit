import { H3Event, defineEventHandler } from 'h3'
import type {APIResponse} from "~/types";

const router = createRouter()

router.post("/signup", defineEventHandler(async event => {
    const response = {} as APIResponse
    const data = await readBody(event) as { name: string, password: string, email: string }

    await createUser(data).catch(async err => {
        useHttpEnd(event,{ error: err.message }, 500)
    })

    const token = await authenticate({email: data.email, password: data.password}).catch(async (err: Error) => {
        useHttpEnd(event, { error: err.message }, 500)
    })

    response.status = 200
    response.body = token
    return await useHttpResponse(event, response)
}))

router.post("/login", defineEventHandler(async event => {
    const response = {} as APIResponse
    const data = await readBody(event) as { password: string, email: string }

    const token = await authenticate({email: data.email, password: data.password}).catch(async (err: Error) => {
        useHttpEnd(event, { error: err.message }, 500)
    })

    response.status = 200
    response.body = token
    return await useHttpResponse(event, response)
}))

router.post("/logout", defineEventHandler(async event => {
    const bearer = getHeader(event, 'bearer')
    const response = {} as APIResponse

    if (!bearer) useHttpEnd(event, { error: "No bearer token provided" }, 401)

    await revokeToken(bearer).catch(async (err: Error) => {
        useHttpEnd(event, { error: err.message }, 500)
    })

    response.status = 200
    response.body = "Logged out"
    return await useHttpResponse(event, response)
}))

export default useController("auth", router)