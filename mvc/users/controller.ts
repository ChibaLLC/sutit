import { type APIResponse, Status } from "~/types";
import { deleteUser, getRecentForms } from "~/mvc/users/queries";

const router = createRouter()

router.delete('/me', defineEventHandler(async event => {
    const response = {} as APIResponse
    const [details, error] = await useAuth(event)
    if (error || !details) {
        response.statusCode = Status.internalServerError
        response.body = error
        return useHttpEnd(event, response, Status.internalServerError)
    }

    const result = await deleteUser(details.user.ulid).catch(e => e as Error)
    if (result instanceof Error) {
        return useHttpEnd(event, { statusCode: 500, body: result.message || "Error On User Delete" })
    }

    response.statusCode = 200
    response.body = "success"

    return response
}))

router.get('/me', defineEventHandler(async event => {
    const response = {} as APIResponse
    const [details, error] = await useAuth(event)
    if (error) {
        response.statusCode = Status.internalServerError
        response.body = error
        return useHttpEnd(event, response, Status.unauthorized)
    }

    response.statusCode = 200
    response.body = {
        email: details!.user.email,
        name: details!.user.name
    }

    return response
}))

router.get("/:userUlid/recents", defineEventHandler(async event => {
    const response = {} as APIResponse
    const [details, error] = await useAuth(event)
    if (!details || error) {
        response.statusCode = Status.internalServerError
        response.body = error
        return useHttpEnd(event, response, Status.unauthorized)
    }

    const forms = await getRecentForms(details.user.ulid).catch(e => e as Error)
    if (forms instanceof Error) {
        response.statusCode = 500
        response.body = forms.message || "Error On Getting Recent Forms"
        return useHttpEnd(event, response)
    }

    response.statusCode = 200
    response.body = { forms }

    return response
}))

export default useController('users', router)
