import { type APIResponse, Status } from "~/types";
import { resetPassword, revokeAuthToken, googleAuth, githubAuth } from "~/mvc/auth/methods";
import { authenticate, createToken } from "~/mvc/auth/queries";
import { createUser, getUserByEmail } from "~/mvc/users/queries";

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

    const token = await authenticate({ email: data.email, password: data.password })
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


router.get("/reset", defineEventHandler(async event => {
    const response = {} as APIResponse
    const { email, origin, redirect } = getQuery(event)
    if (!email || !origin) {
        response.statusCode = Status.badRequest
        response.body = "Email and Origin are required"
        return response
    }
    const user = await getUserByEmail(email.toString()).catch(err => err as Error)
    if (user instanceof Error) {
        response.statusCode = Status.notFound
        response.body = user.message
        return response
    }
    if (!user) {
        response.statusCode = Status.notFound
        response.body = "User not found"
        return response
    }

    const token = await createToken({ userUlid: user.ulid, email: user.email }).catch(err => err as Error)
    if (token instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = token.message
        return response
    }

    await mailResetPasswordLink(email.toString(), origin.toString(), token, redirect?.toString())
    response.statusCode = Status.success
    response.body = "Reset link sent"
    return response
}))

router.post("/reset", defineEventHandler(async event => {
    const query = getQuery(event)
    const email = query.email?.toString()
    const token = query.token?.toString()
    const { password } = await readBody(event) as { password: string, origin: string }
    const response = {} as APIResponse

    if (!email || !token || !password) {
        response.statusCode = Status.badRequest
        response.body = "Email, token and password are required"
        return response
    }

    const user = await getUserByEmail(email).catch(err => err as Error)
    if (user instanceof Error) {
        response.statusCode = Status.notFound
        response.body = user.message
        return response
    }
    if (!user) {
        response.statusCode = Status.notFound
        response.body = "User not found"
        return response
    }

    const reset = await resetPassword({ user, token, password }).catch(err => err as Error)
    if (reset instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = reset.message
        return response
    }

    const _token = await authenticate({ email, password }).catch(err => err as Error)
    if (_token instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = _token.message
        return response
    }
    if (!_token) {
        response.statusCode = Status.internalServerError
        response.body = "Token not generated"
        return response
    }

    response.statusCode = Status.success
    response.body = _token
    return response
}))

router.use("/google/callback", defineEventHandler(async event => {
    const response = {} as APIResponse
    const { id_token } = await readBody(event) as { id_token: string }
    console.log(id_token)
    const token = await googleAuth(id_token).catch(err => err as Error)
    if (token instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = token.message
        return response
    }

    response.statusCode = Status.success
    response.body = token
    return response
}))

router.use("/github/callback", defineEventHandler(async event => {
    const response = {} as APIResponse
    const { code } = getQuery(event)
    if (!code) {
        response.statusCode = Status.badRequest
        response.body = "Code is required"
        return response
    }
    const token = await githubAuth(code.toString()).catch(err => err as Error)
    if (token instanceof Error) {
        response.statusCode = Status.internalServerError
        response.body = token.message
        return response
    }

    setCookie(event, "auth", token)
    return sendRedirect(event, `/dashboard`)
}))


export default useController('auth', router)
