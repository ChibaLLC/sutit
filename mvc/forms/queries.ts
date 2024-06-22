import {forms, responses, formPayments, payments} from "~/db/drizzle/schema";
import db from "~/db";
import {type Drizzle} from "~/db/types";
import {and, eq} from "drizzle-orm";
import {ulid} from "ulid";

export async function createForms(form: Array<Omit<Drizzle.Form.insert, 'ulid'>>): Promise<Array<string>> {
    const _forms = form.map(form => {
        return {...form, ulid: ulid()} satisfies Drizzle.Form.insert
    })
    await db.insert(forms).values(_forms)
    return _forms.map(form => form.ulid)
}

export async function getFormByUlid(formUlid: string): Promise<Drizzle.Form.select | undefined> {
    const results = await db.select().from(forms).where(eq(forms.ulid, formUlid))
    return results.at(0)
}

export async function insertData(userUlid: string, form: Drizzle.Form.insert, data: Array<{
    label: string,
    value: string
}>) {
    const _data = data.map(datum => ({
        formUlid: form.ulid,
        userUlid: userUlid,
        field: datum.label,
        response: datum.value
    } satisfies Drizzle.Responses.insert))

    await db.insert(responses).values(_data)
}

export async function getFormResponses(formUlId: string) {
    return db.select().from(forms).where(eq(forms.ulid, formUlId))
}

export async function getFormsByUser(userUlid: string) {
    return db.select().from(forms).where(eq(forms.userUlid, userUlid));
}

export async function insertFormPayment(details: {
    formUlid: string,
    paymentUlid: string
}) {
    await db.insert(formPayments).values({
        formUlid: details.formUlid,
        paymentUlid: details.paymentUlid,
    } satisfies Drizzle.FormPayment.insert)
}


export async function insertPayment(amount: number, reference_code: string, phone_number: string) {
    const _ulid = ulid()
    await db.insert(payments).values({
        ulid: _ulid,
        amount: amount,
        referenceCode: reference_code,
        phoneNumber: phone_number.slice(-9),
    } satisfies Drizzle.Payment.insert)
    return _ulid
}


export async function getPayment(referenceCode: string) {
    return (await db.select().from(payments)
        .where(eq(payments.referenceCode, referenceCode))).at(0)
}


export async function hasPaid(formUlid: string, phone: string) {
    const _payments = await db.select().from(payments)
        .where(eq(payments.phoneNumber, phone))
        .innerJoin(formPayments, and(eq(formPayments.paymentUlid, payments.ulid), eq(formPayments.formUlid, formUlid)))
    return _payments.length > 0
}