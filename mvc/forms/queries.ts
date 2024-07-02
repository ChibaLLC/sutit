import { formPayments, forms, payments, formResponses, storeResponses, stores } from "~/db/drizzle/schema";
import db from "~/db";
import { type Drizzle } from "~/db/types";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import type { Forms, Stores } from "@chiballc/nuxt-form-builder";

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

export async function createStore(formUlid: string, store: Stores) {
    await db.insert(stores).values({
        ulid: ulid(),
        formUlid: formUlid,
        store: store
    } satisfies Drizzle.Store.insert)
}

export async function getFormByUlid(formUlid: string) {
    const results = await db.select().from(forms).where(eq(forms.ulid, formUlid)).innerJoin(stores, eq(stores.formUlid, forms.ulid))
    return results.at(0)
}

export async function insertData(userUlid: string, formUlid: string, data: { forms: Forms, stores: Stores }) {
    await db.insert(formResponses).values({
        userUlid: userUlid,
        formUlid: formUlid,
        response: data.forms,
    } satisfies Drizzle.FormResponses.insert)

    const _stores = await db.select().from(stores).where(eq(stores.formUlid, formUlid))
    const storeUlid = (_stores && _stores.length > 0) ? _stores.at(0)?.ulid : null

    if (storeUlid) {
        await db.insert(storeResponses).values({
            userUlid: userUlid,
            storeUlid: storeUlid,
            response: data.stores,
        } satisfies Drizzle.StoreResponses.insert)
    }
}

export async function getFormResponses(formUlId: string) {
    return db.select().from(formResponses)
        .where(eq(formResponses.formUlid, formUlId))
        .leftJoin(stores, eq(stores.formUlid, formResponses.formUlid))
}

export async function getFormsByUser(userUlid: string) {
    return db.select()
        .from(forms)
        .where(eq(forms.userUlid, userUlid))
        .innerJoin(stores, eq(stores.formUlid, forms.ulid));
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