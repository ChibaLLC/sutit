import {getFormsByUser} from "../utils/queries";

export default defineEventHandler(async event => {
    const response = {} as APIResponse<Array<{ forms: Drizzle.Form.select; stores: Drizzle.Store.select }>>;
    const [details, error] = await useAuth(event)
    if (!details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    }, Status.unauthorized)

    const forms = await getFormsByUser(details.user.ulid).catch(err => err as Error)
    if (forms instanceof Error) {
        return useHttpEnd(event, {
            body: forms.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
    }

    response.statusCode = Status.success
    response.body = forms as any
    return response
})