import {type APIResponse, type FormField, Status} from "~/types";
import {
    createForm,
    createFormPayment,
    getForm,
    getFormResponses,
    getFormsByUser,
    insertData
} from "~/mvc/v1/forms/queries";
import type {Drizzle} from "~/db/types";

const router = createRouter()

router.post("/create", defineEventHandler(async event => {
    const details = await useAuth(event)
    if (!details) return

    const form = await readBody(event) as {
        name: string,
        payment: {
            paybill: string,
            amount: number
        },
        fields: Array<FormField>
    }

    let payment_details_id = null
    if(form.payment.paybill && form.payment.paybill !== '' && form.payment.amount && form.payment.amount > 0){
        payment_details_id = await createFormPayment(details.user.id, form.payment).catch(err => {
            useHttpEnd(event, {
                statusCode: Status.internalServerError,
                body: err.message || "Unknown error while creating form payment"
            } as APIResponse, Status.internalServerError)
        })

        if (!payment_details_id) return
    }

    const insertForm = {
        formName: form.name,
        paymentDetails: payment_details_id || undefined,
        userId: details.user.id
    } satisfies Omit<Drizzle.Form.insert, 'formUuid'>

    const insertFields = form.fields.map((field, index) => ({
        fieldName: field.name,
        fieldType: field.type,
        required: field?.required ? 1 : 0,
        formPosition: index,
        // @ts-ignore
        fieldOptions: field?.options ? JSON.stringify(field.options) : undefined
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

    return response
}))

router.get("/get/:formUuid", defineEventHandler(async event => {
    const formUuid = event.context.params?.formUuid
    if (!formUuid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const details = await useAuth(event)
    if (!details) return

    const form = await getForm(formUuid).catch(err => {
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

    return response
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

    return response
}))

router.get("/submissions/:formId", defineEventHandler(async event => {
    const formId = event.context.params?.formId
    if (!formId) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const details = await useAuth(event)
    if (!details) return

    const submissions = await getFormResponses(+formId).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while getting form submissions"
        } as APIResponse, Status.internalServerError)
    })

    if (!submissions) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Submissions not found"
    }, Status.notFound)

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = submissions

    return response
}))

router.get("/me", defineEventHandler(async event => {
    const response = {} as APIResponse
    const details = await useAuth(event)
    if (!details) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    }, Status.unauthorized)

    const forms = await getFormsByUser(details.user.id).catch(err => {
        useHttpEnd(event, {
            body: err.message,
            statusCode: Status.internalServerError
        }, Status.internalServerError)
        return []
    })

    response.statusCode = Status.success
    response.body = forms
    return response
}))

export default useController("forms", router)