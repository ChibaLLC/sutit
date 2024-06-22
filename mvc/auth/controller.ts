import {type APIResponse, Status} from "~/types";
import {revokeAuthToken} from "~/mvc/auth/methods";
import {authenticate} from "~/mvc/auth/queries";
import {createUser} from "~/mvc/users/queries";

const router = createRouter()

router.post('/signup', defineEventHandler(async event => {
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

    const create = await createUser(data).catch(async err => err as Error & {code?: string})
    if (create instanceof Error) {
        console.log(create.code)
        const code = create.code === '23505' ? Status.conflict : Status.internalServerError
        return useHttpEnd(event, {
            statusCode: code,
            body: create.message
        }, code)
    }

    const token = await authenticate({email: data.email, password: data.password}).catch(async (err: Error & {
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
}))

router.post('/login', defineEventHandler(async event => {
    const response = {} as APIResponse
    const data = await readBody(event) as { password: string, email: string }

    const revoked = await revokeAuthToken(event).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return false
    })
    if (!revoked) return

    const token = await authenticate({email: data.email, password: data.password})
        .catch((err: Error) => {
            useHttpEnd(event, {
                body: err.message,
                statusCode: Status.unauthorized
            }, Status.unauthorized)
            return false
        })
    if (!token) return

    response.statusCode = Status.success
    response.body = token
    return response
}))


router.get('/logout', defineEventHandler(async event => {
    const response = {} as APIResponse
    const revoke = await revokeAuthToken(event).catch(err => {
        useHttpEnd(event, {
            body: err.message || err,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return false
    })
    if (!revoke) return

    response.statusCode = Status.success
    response.body = "Logged out"
    return response
}))


export default useController('auth', router)
