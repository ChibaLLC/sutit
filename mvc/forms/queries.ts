import { forms, formFields, responses, responseData, formPayments, paymentDetails, payments } from "~/db/drizzle/schema";
import db from "~/db";
import { type Drizzle } from "~/db/types";
import { and, eq } from "drizzle-orm";
import ulid from "ulid";


export async function createFormPayment(formId: number, payment: {
    amount: number
}) {
    await db.insert(paymentDetails).values({
        amount: payment.amount,
        formId: formId
    } satisfies Drizzle.PaymentDetails.insert)

    return (await db.select({
        id: paymentDetails.id
    }).from(paymentDetails)
        .where(eq(paymentDetails.formId, formId))).at(0)?.id
}

export async function createForm(form: Omit<Drizzle.Form.insert, 'formUuid'>, fields: Array<Omit<Drizzle.FormFields.insert, 'formId'>>): Promise<number> {
    const formUUID = ulid.ulid()
    await db.insert(forms).values({ ...form, formUuid: formUUID } satisfies Drizzle.Form.insert)

    const formId = (await db.select({
        id: forms.id
    }).from(forms)
        .where(eq(forms.formUuid, formUUID))).at(0)

    if (!formId) throw new Error("Form not found after creation")
    await db.insert(formFields).values(fields.map(field => ({
        ...field,
        formId: formId.id
    } satisfies Drizzle.FormFields.insert))).catch(console.error)

    return formId.id
}

export function updateFormPaymentDetails(formId: number, payment_details_id: number) {
    return db.update(forms).set({
        paymentDetails: payment_details_id
    }).where(eq(forms.id, formId))
}

export async function getFormByUlid(formUlid: string): Promise<{
    form: Drizzle.Form.select,
    fields: Drizzle.FormFields.select[],
    paymentDetails: Drizzle.PaymentDetails.select
}> {
    const results = await db.select({
        form: forms,
        fields: formFields,
        paymentDetails: paymentDetails
    }).from(forms)
        .innerJoin(formFields, eq(forms.id, formFields.formId))
        .leftJoin(paymentDetails, eq(forms.paymentDetails, paymentDetails.id))
        .where(eq(forms.formUuid, formUlid))

    return {
        form: results[0]?.form || {} as Drizzle.Form.select,
        fields: results.map(result => result.fields),
        paymentDetails: results[0]?.paymentDetails || {} as Drizzle.PaymentDetails.select
    }
}

export async function getFormById(formId: number): Promise<{
    form: Drizzle.Form.select,
    fields: Drizzle.FormFields.select[],
    paymentDetails: Drizzle.PaymentDetails.select
}> {
    const results = await db.select({
        form: forms,
        fields: formFields,
        paymentDetails: paymentDetails
    }).from(forms)
        .innerJoin(formFields, eq(forms.id, formFields.formId))
        .leftJoin(paymentDetails, eq(forms.paymentDetails, paymentDetails.id))
        .where(eq(forms.id, formId))

    return {
        form: results[0]?.form || {} as Drizzle.Form.select,
        fields: results.map(result => result.fields),
        paymentDetails: results[0]?.paymentDetails || {} as Drizzle.PaymentDetails.select
    }
}

export async function insertData(userId: number, formUlid: string, data: Map<number, any>) {
    const form = await getFormByUlid(formUlid)

    await db.insert(responses).values({
        formId: form.form.id,
        userId: userId
    } satisfies Drizzle.Responses.insert).catch(e => {
        log.error(e)
        throw e
    })

    let response: { id: number } | undefined;
    response = (await db.select({
        id: responses.id
    }).from(responses)
        .where(and(eq(responses.userId, userId), eq(responses.formId, form.form.id)))).at(0) || undefined

    if (!response) throw new Error("Response not found after creation")

    const fields = await db.select({
        id: formFields.id,
        name: formFields.fieldName,
        required: formFields.required
    }).from(formFields).where(eq(formFields.formId, form.form.id))

    const missing = []
    for (const field of fields) {
        if (field.required && !data.get(field.id)) {
            missing.push(field.name)
        }
    }

    if (missing.length > 0) throw new Error(`Missing required fields: ${missing.join(",\n")}`)
    const dataToInsert = fields.map(field => {
        return {
            responseId: response!.id,
            formFieldId: field.id,
            value: data.get(field.id)
        } satisfies Drizzle.ResponseData.insert
    })

    await db.insert(responseData).values(dataToInsert)
}

export async function getFormResponses(formUlId: string) {
    return await db.select({
        responses: responses,
        data: responseData
    }).from(forms)
        .innerJoin(responses, eq(responses.formId, forms.id))
        .innerJoin(responseData, eq(responses.id, responseData.responseId))
        .where(eq(forms.formUuid, formUlId))
}

export async function getFormResponse(responseId: number) {
    return await db.select({
        responses: responses,
        data: responseData
    }).from(responses)
        .innerJoin(responseData, eq(responses.id, responseData.responseId))
        .where(eq(responses.id, responseId))
}

export async function getFormsByUser(userId: number) {
    return await db.select({
        formUuid: forms.formUuid,
        formName: forms.formName,
        paymentDetails: paymentDetails.id,
        createdAt: forms.createdAt
    }).from(forms)
        .leftJoin(paymentDetails, eq(forms.paymentDetails, paymentDetails.id))
        .where(eq(forms.userId, userId))
}

export async function insertFormPayment(details: {
    form_id: number,
    amount: number,
    phone: string,
    referenceCode: string
}) {
    await insertPayment(details.amount, details.referenceCode, details.phone)
    
    const payment = await getPayment(details.referenceCode)
    if(!payment) throw new Error("Payment not found after creation")

    await db.insert(formPayments).values({
        formId: details.form_id,
        paymentId: payment.id,
    } satisfies Drizzle.FormPayment.insert)
}


export async function insertPayment(amount: number, reference_code: string, phone_number: string){
    await db.insert(payments).values({
        amount: amount,
        referenceCode: reference_code,
        phoneNumber: phone_number.slice(-9)
    } satisfies Drizzle.Payment.insert)
}


export async function getPayment(referenceCode: string) {
    return (await db.select({
        id: payments.id,
        amount: payments.amount,
        phoneNumber: payments.phoneNumber
    }).from(payments)
        .where(eq(payments.referenceCode, referenceCode))).at(0)
}


export async function hasPaid(formId: number, phone: string) {
    return (await db.select({
        id: payments.id
    }).from(payments)
        .innerJoin(formPayments, eq(formPayments.paymentId, payments.id))
        .where(and(eq(formPayments.formId, formId), eq(payments.phoneNumber, phone.slice(-9))))).length > 0
}