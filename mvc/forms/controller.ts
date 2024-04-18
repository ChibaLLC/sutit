import {type APIResponse, type FormField, Status} from "~/types";
import {
    createForm,
    createFormPayment,
    getFormByUlid, getFormResponses,
    getFormsByUser, hasPaid, insertData,
    updateFormPaymentDetails
} from "~/mvc/forms/queries";
import type {Drizzle} from "~/db/types";
import {getUserById} from "~/mvc/users/queries";
import {processFormPayments} from "~/mvc/forms/methods";

const router = createRouter()

router.get('/:formUlid', defineEventHandler(async event => {
    const formUuid = getRouterParam(event, "formUlid")
    if (!formUuid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const form = await getFormByUlid(formUuid).catch(err => {
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

router.post('/create', defineEventHandler(async event => {
    const [details, error] = await useAuth(event)
    if (error) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: error
    }, Status.unauthorized)

    const form = await readBody(event) as {
        name: string,
        payment: {
            amount: number
        },
        fields: Array<FormField>
    }

    const insertForm = {
        formName: form.name,
        userId: details!.user.id,
        id: undefined,
        paymentDetails: undefined
    } satisfies Omit<Drizzle.Form.insert, 'formUuid'>

    const insertFields = form.fields.map((field: any, index) => ({
        fieldName: field.name,
        fieldType: field.type,
        required: !!field?.required,
        formPosition: index,
        id: undefined,
        fieldOptions: field?.options ? JSON.stringify(field.options) : undefined
    }) satisfies Omit<Drizzle.FormFields.insert, 'formId'>)

    const formId = await createForm(insertForm, insertFields).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while creating form"
        } as APIResponse, Status.internalServerError)
    })

    if (!formId) return useHttpEnd(event, {
        statusCode: Status.internalServerError,
        body: "Unknown error while creating form"
    } as APIResponse, Status.internalServerError)

    if (form.payment.amount && form.payment.amount > 0) {
        const payment_details_id = await createFormPayment(formId, form.payment).catch(err => {
            useHttpEnd(event, {
                statusCode: Status.internalServerError,
                body: err.message || "Unknown error while creating form payment"
            } as APIResponse, Status.internalServerError)
        })

        if (!payment_details_id) return useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: "Unknown error while creating form payment"
        } as APIResponse, Status.internalServerError)

        updateFormPaymentDetails(formId, payment_details_id).catch(err => {
            useHttpEnd(event, {
                statusCode: Status.internalServerError,
                body: err.message || "Unknown error while updating form payment details"
            } as APIResponse, Status.internalServerError)
        })
    }

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = "Form created"

    return response
}))


router.get('/me', defineEventHandler(async event => {
    const response = {} as APIResponse
    const [details, error] = await useAuth(event)
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


router.post('/submit/:formUlid', defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })
    const data = await readBody(event) as {
        fields: Record<number, any>
    }

    const fieldsMap = new Map<number, any>()
    for (const [id, value] of Object.entries(data.fields)) {
        fieldsMap.set(Number(id), value)
    }

    await insertData(details!.user.id, formUlid, fieldsMap).catch(err => {
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

router.get('/submissions/:formUlid', defineEventHandler(async event => {
    const formUlid = event.context.params?.formUlid
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const [details, error] = await useAuth(event)
    if (error) return useHttpEnd(event, {
        statusCode: Status.unauthorized,
        body: "Unauthorized"
    })

    const submissions = await getFormResponses(formUlid).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while getting form submissions"
        } as APIResponse, Status.internalServerError)

        return null
    })

    const response = {} as APIResponse
    response.statusCode = Status.success
    response.body = submissions

    return response
}))


router.post('/pay/:formUlid', defineEventHandler(async event => {
    const formUlid = getRouterParam(event, "formUlid")
    if (!formUlid) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "No form ID provided"
    }, Status.badRequest)

    const details = await readBody(event) as { phone: string, identity: string | undefined }
    details.identity = details.identity || getHeader(event, "X-Request-ID")

    if (!details.phone || !details.identity) return useHttpEnd(event, {
        statusCode: Status.badRequest,
        body: "Phone and identity of the request origin are required; identity can be a UUID or a phone number with country code"
    }, Status.badRequest)

    const form = await getFormByUlid(formUlid).catch(err => {
        useHttpEnd(event, {
            statusCode: Status.internalServerError,
            body: err.message || "Unknown error while getting form"
        } as APIResponse, Status.internalServerError)
    })

    if (!form) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "Form not found"
    }, Status.notFound)

    if(await hasPaid(form.form.id, details.phone)){
        return useHttpEnd(event, {
            statusCode: Status.success,
            body: "Payment already made"
        }, Status.success)
    }

    const user = await getUserById(form.form.userId)

    if (!user) return useHttpEnd(event, {
        statusCode: Status.notFound,
        body: "User not found"
    }, Status.notFound)


    await processFormPayments(event, form, {identity: details.identity, phone: details.phone}, user.email)
}))

export default useController('forms', router)