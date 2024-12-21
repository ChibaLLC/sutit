import {createForm} from "./utils/queries"
import { formCreateSchema } from "./utils/zod"

export default defineEventHandler(async event => {
    const details = await useAuth(event)
    const {data} = await readValidatedBody(event, formCreateSchema.safeParse)
    const formUlid = await createForm(data!, details).catch(err => {
        throw createError({
            message: err.message || "Unknown error occurred while creating the form",
            statusCode: Status.internalServerError,
            data: err,
        })
    })

    const response = {} as APIResponse<string>
    response.statusCode = Status.created
    response.body = formUlid

    return response
})