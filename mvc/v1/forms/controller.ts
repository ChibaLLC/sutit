import {type APIResponse, Status} from "~/types";
import {createForm, getForm, insertData} from "~/mvc/v1/forms/queries";
import type {Drizzle} from "~/db/types";

const router = createRouter()

router.post("/new", defineEventHandler(async event => {
    const details = await useAuth(event)
    if (!details) return

    const form = await readBody(event) as {
        name: string,
        fields: Array<{ name: string, type: string, required: boolean }>
    }

    const insertForm = {
        formName: form.name,
        userId: details.user.id
    } satisfies Omit<Drizzle.Form.insert, 'formUuid'>

    const insertFields = form.fields.map(field => ({
        fieldName: field.name,
        fieldType: field.type,
        required: field.required ? 1 : 0
    }) satisfies Omit<Drizzle.FormFields.insert, 'formId'>)

    await createForm(insertForm, insertFields).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while creating form"
        } as APIResponse, Status.internalServerError)
    })

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = "Form created"

    return await useHttpResponse(event, response)
}))

router.get("/get/:formId", defineEventHandler(async event => {
    const formId = event.context.params?.formId
    if (!formId) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const details = await useAuth(event)
    if (!details) return

    const form = await getForm(+formId).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while getting form"
        } as APIResponse, Status.internalServerError)
    })

    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = form

    return await useHttpResponse(event, response)
}))

router.post("/submit/:formId", defineEventHandler(async event => {
    const formId = event.context.params?.formId
    if (!formId) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const details = await useAuth(event)
    if (!details) return

    const data = await readBody(event) as {
        [key: string]: string | number | boolean | null
    }

    await insertData(details.user.id, +formId, data).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while submitting form"
        } as APIResponse, Status.internalServerError)
    })

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = "Form submitted"

    return await useHttpResponse(event, response)
}))

export default useController("forms", router)