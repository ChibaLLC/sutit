import {revokeAuthToken} from "~~/server/api/v1/auth/utils";
import {createUser} from "~~/server/mvc/users/queries";
import {authenticate} from "~~/server/api/v1/auth/utils/queries";

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
        data.name = useCapitalize(data.email.split('@')[0] || "anonimous")
    }

    const revoked = await revokeAuthToken(event).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return false
    })
    if (!revoked) return

    const create = await createUser(data).catch(async err => err as Error & { code?: string })
    if (create instanceof Error) {
        console.log(create.code)
        const code = create.code === '23505' ? Status.conflict : Status.internalServerError
        return useHttpEnd(event, {
            statusCode: code,
            body: create.message
        }, code)
    }

    const token = await authenticate({ email: data.email, password: data.password }).catch(async (err: Error & {
        code?: string
    }) => err)
    if (token instanceof Error) {
        return useHttpEnd(event, {
            body: token.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
    }

    response.statusCode = Status.success
    response.body = token
    return response
})