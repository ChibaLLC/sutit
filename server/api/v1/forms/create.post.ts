import {createForm} from "./utils/queries"
import { formCreateSchema } from "./utils/zod"

export default defineEventHandler(async event => {
    const details = await useAuth(event)
    const {data, error} = await readValidatedBody(event, formCreateSchema.safeParse)
    if(!data || error){
        throw createError({
            statusCode: 400,
            data: error
        })
    }
    const form_meta = await createForm(data, details).catch(err => {
        log.error(err)
        throw createError({
            message: err.message || "Unknown error occurred while creating the form",
            statusCode: Status.internalServerError
        })
    })

    return form_meta
})