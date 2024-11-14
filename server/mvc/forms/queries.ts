import { formPayments, forms, payments, formResponses, storeResponses, stores, prepaidForms } from "~~/server/db/drizzle/schema";
import db from "../../db";
import { type Drizzle } from "~~/server/db/types";
import { and, eq, desc, sum, count } from "drizzle-orm";
import { ulid } from "ulid";
import type { Forms, Stores } from "@chiballc/nuxt-form-builder";

export async function createForm(data: {
    name: string,
    description?: string,
    price: {
        individual: number,
        group?: {
            amount?: number,
            limit?: number
        }
    },
    userUlid: string,
    pages: Forms,
    allowGroups: boolean
}) {
    const form = {
        formName: data.name,
        pages: data.pages,
        ulid: ulid(),
        formDescription: data.description,
        userUlid: data.userUlid,
        allowGroups: data.allowGroups,
        price_group_amount: data.price.group?.amount,
        price_group_count: data.price.group?.limit,
        price_individual: data.price.individual
    } satisfies Drizzle.Form.insert
    await db.insert(forms).values(form)
    return form.ulid
}

export async function updateForm(formUlid: string, name: string, description: string, price: number, pages: Forms) {
    await db.update(forms).set({
        formName: name,
        formDescription: description,
        price_individual: price,
        pages: pages
    }).where(eq(forms.ulid, formUlid))
}

export function deleteForm(formUlid: string) {
    return db.delete(forms)
        .where(eq(forms.ulid, formUlid))
}

export async function createStore(formUlid: string, store: Stores) {
    await db.insert(stores).values({
        ulid: ulid(),
        formUlid: formUlid,
        store: store
    } satisfies Drizzle.Store.insert)
}

export async function updateStore(formUlid: string, store: Stores) {
    await db.update(stores).set({
        store: store
    }).where(eq(stores.formUlid, formUlid))
}

export async function getFormByUlid(formUlid: string) {
    const results = await db.select().from(forms).where(eq(forms.ulid, formUlid)).innerJoin(stores, eq(stores.formUlid, forms.ulid))
    return results.at(0)
}

export async function insertData(formUlid: string, data: { forms: { pages: Forms }, stores: Stores }, price?: string | number) {
    await db.insert(formResponses).values({
        formUlid: formUlid,
        response: data.forms.pages,
        price: price ? +price : 0
    } satisfies Drizzle.FormResponses.insert)

    const _stores = await db.select().from(stores).where(eq(stores.formUlid, formUlid))
    const storeUlid = (_stores && _stores.length > 0) ? _stores.at(0)?.ulid : null

    if (storeUlid) {
        await db.insert(storeResponses).values({
            storeUlid: storeUlid,
            response: data.stores,
        } satisfies Drizzle.StoreResponses.insert)
    }
}

export async function getFormResponses(formUlId: string) {
    return db.select().from(formResponses)
        .where(eq(formResponses.formUlid, formUlId))
        .leftJoin(stores, eq(stores.formUlid, formResponses.formUlid))
        .orderBy(desc(formResponses.createdAt))
}

export async function getFormsByUser(userUlid: string) {
    return db.select()
        .from(forms)
        .where(eq(forms.userUlid, userUlid))
        .innerJoin(stores, eq(stores.formUlid, forms.ulid))
        .orderBy(desc(forms.createdAt))
}

export async function insertFormPayment(details: {
    formUlid: string,
    paymentUlid: string
}) {
    const processed = await isProcessedFormPayment(details)
    if (processed) return
    await db.insert(formPayments).values({
        formUlid: details.formUlid,
        paymentUlid: details.paymentUlid,
    } satisfies Drizzle.FormPayment.insert).catch(e => {
        console.error(e)
        throw e
    })
}

export async function isProcessedFormPayment(details: {
    formUlid: string,
    paymentUlid: string
}) {
    const payment = await db.select().from(formPayments).where(and(eq(formPayments.formUlid, details.formUlid), eq(formPayments.paymentUlid, details.paymentUlid)))
    if (payment.length) return payment.at(0)
    return false
}


export async function insertPayment(amount: number, reference_code: string, phone_number: string) {
    const processed = await isProcessedPayment(reference_code)
    if (processed) {
        log.warn("Attempt to re-process payment", reference_code)
        return processed.ulid
    }

    const _ulid = ulid()
    await db.insert(payments).values({
        ulid: _ulid,
        amount: amount,
        referenceCode: reference_code,
        phoneNumber: phone_number.slice(-9),
    } satisfies Drizzle.Payment.insert).catch(e => {
        console.error(e)
        throw e
    })
    return _ulid
}

export async function isProcessedPayment(ref_code: string) {
    const payment = await db.select().from(payments).where(eq(payments.referenceCode, ref_code))
    if (payment.length) return payment.at(0)
    return false
}


export async function getPayment(referenceCode: string) {
    return (await db.select().from(payments)
        .where(eq(payments.referenceCode, referenceCode))).at(0)
}

export async function getFormPayments(formUulid: string) {
    return db.select().from(formPayments).where(eq(formPayments.formUlid, formUulid))
}

export async function getFormPaymentsSum(formUulid: string) {
    const form = await getFormByUlid(formUulid)
    if (!form) return 0
    const result = await db.select({ total: sum(payments.amount) })
        .from(formPayments)
        .where(eq(formPayments.formUlid, formUulid))
        .innerJoin(payments, eq(formPayments.paymentUlid, payments.ulid))

    const total = result.reduce((acc, curr) => {
        const { total } = curr
        if (!total) return acc
        return acc + +total
    }, 0)

    return total - (form.forms.withDrawnFunds || 0)
}


export async function getAllFormPayments(userUlid: string) {
    return db.select().from(forms).where(eq(forms.userUlid, userUlid)).innerJoin(formPayments, eq(formPayments.formUlid, forms.ulid))
}

export async function getAllFormPaymentsSum(userUlid: string) {
    const _sum = await db.select({ total: sum(payments.amount) })
        .from(forms)
        .where(eq(forms.userUlid, userUlid))
        .innerJoin(formPayments, eq(formPayments.formUlid, forms.ulid))
        .innerJoin(payments, eq(formPayments.paymentUlid, payments.ulid))

    return _sum.reduce((acc, curr) => {
        const { total } = curr
        if (!total) return acc
        return acc + +total
    }, 0)
}

export async function getFormCount(userUlid: string) {
    const result = await db.select({ count: count(forms.ulid) }).from(forms).where(eq(forms.userUlid, userUlid))
    return result.reduce((acc, curr) => {
        const { count } = curr
        if (!count) return acc
        return acc + +count
    }, 0)
}

export async function getResponsesCount(userUlid: string) {
    const result = await db.select({ count: count(forms.ulid) })
        .from(forms)
        .where(eq(forms.userUlid, userUlid))
        .innerJoin(formResponses, eq(formResponses.formUlid, forms.ulid))
    return result.reduce((acc, curr) => {
        const { count } = curr
        if (!count) return acc
        return acc + +count
    }, 0)
}

type Form = { forms: Drizzle.Form.select, stores?: Drizzle.Store.select }
export async function neeedsPay(Form: Form | string, type: "group" | "individual", submitPrice?: number): Promise<[Form, boolean]> {
    let form: Form
    if (typeof Form === 'string') {
        const _form = await getFormByUlid(Form)
        if (_form) {
            form = _form
        } else {
            throw new Error(`Form ${_form} not found`)
        }
    } else {
        form = Form
    }
    let price;
    if (type === 'individual') {
        price = form.forms.price_individual
    } else {
        price = form.forms.price_group_count || 0
    }

    if (price <= 0 && (!submitPrice || submitPrice <= 0)) return [form, false]
    return [form, true]
}


export function needsIndividualPayment(Form: Form | string, submitPrice?: number) {
    return neeedsPay(Form, 'individual', submitPrice)
}

export async function needsGroupPayment(Form: Form | string, submitPrice?: number) {
    return neeedsPay(Form, 'group', submitPrice)
}


export async function getRecentForms(userUlid: string) {
    return db.select().from(forms)
        .where(eq(forms.userUlid, userUlid))
        .limit(5)
        .orderBy(desc(forms.updatedAt))
}


export async function updateFormWithdrawnFunds(formUlid: string, amount: number) {
    const form = await getFormByUlid(formUlid)
    await db.update(forms).set({
        withDrawnFunds: Number((form?.forms.withDrawnFunds || 0)) + amount
    }).where(eq(forms.ulid, formUlid))
}

export function insertPrepaidLinkData(data: Drizzle.PrepaidForms.insert[]) {
    return db.insert(prepaidForms).values(data)
}

export async function getPrepaidFormLink(token: string) {
    const data = await db.select().from(prepaidForms).where(eq(prepaidForms.token, token))
    return data.at(0)
}

export async function invalidatePrepaidFormLink(token: string) {
    return db.update(prepaidForms).set({
        isValid: false
    }).where(eq(prepaidForms.token, token))
}