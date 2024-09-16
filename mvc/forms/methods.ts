import type {Drizzle} from "~/db/types";
import {call_b2b, call_b2c, call_stk} from "~/mvc/mpesa/methods";
import {createChannelName} from "~/server/utils/socket";
import {getUserByUlId} from "../users/queries";
import excel from "exceljs";
import type {FormElementData} from "@chiballc/nuxt-form-builder";
import {
    getAllFormPaymentsSum,
    getFormByUlid,
    getFormCount,
    getFormPaymentsSum,
    getResponsesCount,
    updateFormWithdrawnFunds
} from "~/mvc/forms/queries";
import type {BuyGoodsCreditMethod, CreditMethod, PayBillCreditMethod, PhoneCreditMethod} from "~/types";

declare global {
    var formPaymentProcessingQueue: Map<string, {
        form: Drizzle.Form.select,
        callback?: (...args: any[]) => any
    }>
}

export async function processFormPayments(form: Drizzle.Form.select, details: {
    phone: string;
    amount: number
}, accountNumber: string, callback?: (...args: any[]) => any) {
    details.phone = `254${details.phone.slice(-9)}`
    const result = await makeSTKPush(details.phone, form.formName, details.amount, accountNumber)
    const channel = createChannelName(result.MerchantRequestID, result.CheckoutRequestID)
    if (!global.formPaymentProcessingQueue) global.formPaymentProcessingQueue = new Map()
    global.formPaymentProcessingQueue.set(channel, {form, callback})
    return {
        statusCode: 201,
        body: {
            merchantRequestID: result.MerchantRequestID,
            checkoutRequestID: result.CheckoutRequestID
        }
    }
}

async function makeSTKPush(phone: string, pay_for: string, amount: number, accountNumber: string) {
    return await call_stk(+phone, amount, `Payment for ${pay_for} form`, accountNumber)
}


export async function sendUserMail(user: { userUlid?: string, email?: string }, message: string, subject: string) {
    let email = user.email
    if (!email) {
        const _user = await getUserByUlId(user.userUlid!)
        email = _user?.email
    }
    if (!email) return log.warn("User has no email")

    return sendMail({
        to: email,
        text: message,
        subject: subject
    })
}

type Entries = {
    stores: {
        ulid: string;
        createdAt: string;
        updatedAt: string;
        formUlid: string;
        store: unknown;
    } | null;
    form_responses: {
        price: number | null;
        createdAt: string;
        updatedAt: string;
        formUlid: string;
        response: unknown;
        id: number;
    };
}

export async function constructExcel(data: Entries[], user: Drizzle.User.select) {
    function getFields(pages: Record<string, FormElementData[]>): FormElementData[] {
        return Object.values(pages || {}).reduce((acc, page) => {
            return acc.concat(page)
        }, [])
    }

    function isFormElementData(data: any): data is Record<string, FormElementData[]> {
        return !data.hasOwnProperty('pages')
    }

    const workbook = new excel.Workbook()
    workbook.creator = "Sutit Investment Limited"
    workbook.lastModifiedBy = user.name || "Unknown"
    workbook.created = new Date()
    if (data.length === 0) return workbook.xlsx

    const forms = await getFormByUlid(data.at(0)!.form_responses.formUlid).catch(err => err as Error)
    if (forms instanceof Error) return workbook.xlsx

    const form = forms!.forms
    const hasPayment = form.price !== 0 || Object.values(forms?.stores.store || {}).some(store => store.some((item: any) => item.price !== 0))
    const worksheet = workbook.addWorksheet(form.formName)

    const titles: string[] = getFields(form.pages as Record<string, FormElementData[]>).map(field => field.label)
    if (hasPayment) titles.push("Price")
    worksheet.addRow(titles).font = {bold: true}

    const responses = (response: Entries[]) => {
        if (!response) return {} as {
            meta: Entries;
            response: Record<string, FormElementData[]> | undefined;
        }[]
        return response.map(entry => {
            if (isFormElementData(entry.form_responses.response)) {
                return {
                    meta: entry.form_responses,
                    response: entry.form_responses.response
                }
            } else {
                return {
                    meta: entry.form_responses,
                    // @ts-ignore
                    response: entry.form_responses.response!.pages
                }
            }
        })
    }

    responses(data).forEach(response => {
        const values: string[] = getFields(response.response as Record<string, FormElementData[]>).map(field => field.value)
        if (hasPayment) {
            // @ts-ignore
            values.push(response.meta?.price?.toString() || "UNRECORDED")
        }
        worksheet.addRow(values)
    })

    return workbook.xlsx
}

function isPhoneCreditMethod(creditMethod: CreditMethod): creditMethod is PhoneCreditMethod {
    return !!creditMethod?.phone
}

function isPayBillCreditMethod(creditMethod: CreditMethod): creditMethod is PayBillCreditMethod {
    return !!creditMethod?.paybill_no && !!creditMethod?.account_no
}

function isBuyGoodsCreditMethod(creditMethod: CreditMethod): creditMethod is BuyGoodsCreditMethod {
    return !!creditMethod?.till_no
}

export async function withdrawFunds(data: {
    formUlid: string,
    creditMethod: CreditMethod,
    reason: string,
    requester?: string
}) {
    const total = await getFormPaymentsSum(data.formUlid)
    if (!total) return log.error("No payments found")

    switch (data.creditMethod) {
        case isPhoneCreditMethod(data.creditMethod):
            data.creditMethod.phone = `254${data.creditMethod.phone.slice(-9)}`
            const result = await call_b2c({phone_number: data.creditMethod.phone, amount: total, reason: `Withdrawal for ${data.reason} by ${data.requester}`})
            if (!result) return log.error("Failed to send funds")
            break
        case isPayBillCreditMethod(data.creditMethod):
            const result = await call_b2b({
                paybill: {
                    business_no: data.creditMethod.paybill_no,
                    account_no: data.creditMethod.account_no
                },
                amount: total,
                requester: data.requester
            })
            if (!result) return log.error("Failed to send funds")
            break
        case isBuyGoodsCreditMethod(data.creditMethod):
            const result = await call_b2b({
                till_number: data.creditMethod.till_no,
                amount: total,
                requester: data.requester
            })
            if (!result) return log.error("Failed to send funds")
            break
        default:
            return log.error("Invalid credit method")
    }

    await updateFormWithdrawnFunds(data.formUlid, total)

    return result
}


export async function getStats(userUlid: string) {
    const formsCount = await getFormCount(userUlid)
    const responsesCount = await getResponsesCount(userUlid)
    const totalPayments = await getAllFormPaymentsSum(userUlid)
    return {
        forms: formsCount,
        responses: responsesCount,
        earnings: totalPayments
    }
}