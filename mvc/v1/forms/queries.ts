import {forms, formFields, responses, responseData} from "~/db/drizzle/schema";
import db from "~/db";
import {type Drizzle} from "~/db/types";
import {eq} from "drizzle-orm";
import ulid from "ulid";

export async function createForm(form: Omit<Drizzle.Form.insert, 'formUuid'>, fields: Array<Omit<Drizzle.FormFields.insert, 'formId'>>): Promise<void> {
    const formUUID = ulid.ulid()
    await db.insert(forms).values({...form, formUuid: formUUID} satisfies Drizzle.Form.insert)

    const formId = (await db.select({
        id: forms.id
    }).from(forms)
        .innerJoin(formFields, eq(forms.userId, form.userId))
        .where(eq(forms.formUuid, formUUID))).at(0)

    if (!formId) throw new Error("Form not found after creation")
    await db.insert(formFields).values(fields.map(field => ({
        ...field,
        formId: formId.id
    } satisfies Drizzle.FormFields.insert)))
}

export async function getForm(formId: number) {
    return db.select({
        form: forms,
        fields: formFields
    }).from(forms)
        .innerJoin(formFields, eq(forms.id, formFields.formId))
        .where(eq(forms.id, formId))
}

export async function insertData(userId: number, formId: number, data: {
    [key: string]: string | number | boolean | null
}) {
    await db.insert(responses).values({
        formId: formId,
        userId: userId
    } satisfies Drizzle.Responses.insert)

    const responseId = (await db.select({
        id: responses.id
    }).from(responses)
        .where(eq(responses.userId, userId))).at(0)

    if (!responseId) throw new Error("Response not found after creation")

    const fields = await db.select({
        id: formFields.id,
        name: formFields.fieldName,
        required: formFields.required
    }).from(formFields).where(eq(formFields.formId, formId))


    const keys = Object.keys(data)
    const missing = []
    for (const field of fields) {
        if (field.required && !keys.includes(field.name)) {
            missing.push(field.name)
        }
    }

    if (missing.length > 0) throw new Error(`Missing required fields: ${missing.join(",\n")}`)

    const dataToInsert = fields.map(field => ({
        responseId: responseId.id,
        formFieldId: field.id,
        value: data[field.name]?.toString() || ''
    } satisfies Drizzle.ResponseData.insert))

    await db.insert(responseData).values(dataToInsert)
}

export async function getFormResponses(formId: number) {
    return db.select({
        responses: responses,
        data: responseData
    }).from(responses)
        .innerJoin(responseData, eq(responses.id, responseData.responseId))
        .where(eq(responses.formId, formId))
}

export async function getFormResponse(responseId: number) {
    return db.select({
        responses: responses,
        data: responseData
    }).from(responses)
        .innerJoin(responseData, eq(responses.id, responseData.responseId))
        .where(eq(responses.id, responseId))
}

export async function getFormByUUID(formUUID: string) {
    return db.select({
        form: forms,
        fields: formFields
    }).from(forms)
        .innerJoin(formFields, eq(forms.id, formFields.formId))
        .where(eq(forms.formUuid, formUUID))
}

export async function getFormByUser(userId: number) {
    return db.select({
        form: forms,
        fields: formFields
    }).from(forms)
        .innerJoin(formFields, eq(forms.id, formFields.formId))
        .where(eq(forms.userId, userId))
}