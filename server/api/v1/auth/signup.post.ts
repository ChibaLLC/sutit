import {type APIResponse, Status} from "~/types";
import {revokeAuthToken} from "~/server/mvc/auth/methods";
import {createUser} from "~/server/mvc/users/queries";
import {authenticate} from "~/server/mvc/auth/queries";

export default defineEventHandler(async event => {
    const response = {} as APIResponse
    const data = await readBody(event) as { name: string, password: string, email: string }

    for (const key of Object.keys(data)) {
        if (typeof data[key as keyof typeof data] === 'string') {
            data[key as keyof typeof data] = data[key as keyof typeof data].trim()
        }
    }

    if (!data.password || !data.email) {
        return useHttpEnd(event, {
            body: "Password and email are required",
            statusCode: Status.badRequest
        }, Status.badRequest)
    }

    if (data?.name === '' || !data.name) {
        data.name = useCapitalize(data.email.split('@')[0])
    }

    const revoked = await revokeAuthToken(event).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return false
    })
    if (!revoked) return

    const create = await createUser(data).catch(async err => {
        const code = err?.code === 'ER_DUP_ENTRY' ? Status.conflict : Status.internalServerError
        useHttpEnd(event, {
            statusCode: code,
            body: err.message
        }, code)
        return false
    })
    if (!create) return

    const token = await authenticate({ email: data.email, password: data.password }).catch(async (err: Error) => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return false
    })
    if (!token) return

    response.statusCode = Status.success
    response.body = token
    return response
})