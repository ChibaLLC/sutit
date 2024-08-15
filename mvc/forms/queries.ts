import { formPayments, forms, payments, formResponses, storeResponses, stores } from "~/db/drizzle/schema";
import db from "~/db";
import { type Drizzle } from "~/db/types";
import { and, eq, desc, sum, count } from "drizzle-orm";
import { ulid } from "ulid";
import type { FormElementData, Forms, Stores } from "@chiballc/nuxt-form-builder";

export async function createForm(name: string, description: string, price: number, userUlid: string, pages: Forms): Promise<string> {
    const _form = {
        pages: pages,
        ulid: ulid(),
        formName: name,
        formDescription: description,
        userUlid: userUlid,
        price: price
    } satisfies Drizzle.Form.insert
    await db.insert(forms).values(_form)
    return _form.ulid
}

export async function updateForm(formUlid: string, name: string, description: string, price: number, pages: Forms) {
    await db.update(forms).set({
        formName: name,
        formDescription: description,
        price: price,
        pages: pages
    }).where(eq(forms.ulid, formUlid))
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

export async function insertData(formUlid: string, data: { forms: { pages: FormElementData[] }, stores: Stores }, price?: string | number) {
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

    return total - form.forms.withDrawnFunds
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
        .groupBy(forms.ulid)

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


export async function assessForm(formUlid: string, phone: string): Promise<[{ forms: Drizzle.Form.select, store?: Drizzle.Store.select }, boolean]> {
    const form = await getFormByUlid(formUlid)
    if (!form) {
        throw new Error("Form Does Not Exist")
    }
    if (form?.forms.price <= 0) return [form, true]
    const _payments = await db.select().from(payments)
        .where(eq(payments.phoneNumber, `254${phone.slice(-9)}`))
        .innerJoin(formPayments, and(eq(formPayments.paymentUlid, payments.ulid), eq(formPayments.formUlid, formUlid)))
    return [form, _payments.length > 0]
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
