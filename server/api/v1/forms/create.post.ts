import {type APIResponse, type FormField, Status} from "~/types";
import type {Drizzle} from "~/db/types";
import {createForm, createFormPayment, updateFormPaymentDetails} from "~/server/mvc/v1/forms/queries";

export default defineEventHandler(async event => {
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
})