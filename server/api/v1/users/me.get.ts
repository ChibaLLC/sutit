import {type APIResponse, Status} from "~/types";

export default defineEventHandler(async event => {
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
})