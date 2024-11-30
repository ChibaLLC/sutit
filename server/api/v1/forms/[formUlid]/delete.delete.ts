import {deleteUserForm} from "../utils";

export default defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) {
        return createError({
            status: 400,
            message: "No formUlid provided"
        })
    }

    const [user, error] = await useAuth(event)
    if (!user || error) {
        return createError({
            statusCode: 403,
            message: error || "Error getting user"
        })
    }

    const result = await deleteUserForm(user.user.ulid, formUlid).catch((e: Error) => e)
    if (result instanceof Error) {
        return createError({
            status: 500,
            data: result,
            message: result.message
        })
    }

    return createResponse({
        statusCode: 200,
        statusMessage: "OK"
    })
})