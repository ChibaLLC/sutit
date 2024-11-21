import type { Drizzle } from "~~/server/db/types";
import { call_b2b, call_b2c, call_stk } from "../../mvc/mpesa/methods";
import { getUserByUlId } from "../users/queries";
import excel from "exceljs";
import type { FormElementData } from "@chiballc/nuxt-form-builder";
import {
    deleteForm,
    getAllFormPaymentsSum,
    getFormByUlid,
    getFormCount,
    getFormPaymentsSum,
    getPrepaidFormLink,
    getResponsesCount,
    insertPrepaidLinkData,
    updateFormWithdrawnFunds
} from "../../mvc/forms/queries";
import { v4 } from "uuid";

declare global {
    var formPaymentProcessingQueue: Map<string, {
        form: Drizzle.Form.select,
        callback?: (paymentUlid: string) => any
    }>
}

export async function processFormPayments(form: Drizzle.Form.select, details: {
    phone: string;
    amount: number
}, accountNumber: string, callback?: (paymentUlid: string) => any) {
    details.phone = `254${details.phone.slice(-9)}`
    const result = await makeSTKPush(details.phone, form.formName, details.amount, accountNumber)
    const channel = createChannelName(result.MerchantRequestID, result.CheckoutRequestID)
    if (!global.formPaymentProcessingQueue) global.formPaymentProcessingQueue = new Map()
    global.formPaymentProcessingQueue.set(channel, { form, callback })
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
    const hasPayment = form.price_individual !== 0 || Object.values(forms?.stores.store || {}).some(store => (store as Array<any>).some((item: any) => item.price !== 0)) || form.price_group_amount !== 0
    const worksheet = workbook.addWorksheet(form.formName)

    const titles: string[] = getFields(form.pages as Record<string, FormElementData[]>).map(field => field.label)
    if (hasPayment) titles.push("Price")
    worksheet.addRow(titles).font = { bold: true }

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

    switch (true) {
        case isPhoneCreditMethod(data.creditMethod):
            data.creditMethod.phone = `254${data.creditMethod.phone.slice(-9)}`
            var result = await call_b2c({ phone_number: data.creditMethod.phone, amount: total, reason: `Withdrawal for ${data.reason} by ${data.requester}` })
            if (!result) return log.error("Failed to send funds")
            break
        case isPayBillCreditMethod(data.creditMethod):
            var result = await call_b2b({
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
            var result = await call_b2b({
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

export async function deleteUserForm(userUlid: string, formUlid: string) {
    const form = await getFormByUlid(formUlid)
    if (!form) throw new Error(`Form with ULID ${formUlid} was not found`);
    if (form.forms.userUlid !== userUlid) throw new Error(`Form ${formUlid} does not belong to user ${userUlid} and therefore cannot be deleted by them`);
    return deleteForm(formUlid)
}

type Form = { forms: Drizzle.Form.select, stores?: Drizzle.Store.select }
export async function generateFormLinkTokens(data: {
    form: string | Form,
    formPaymentulid?: string,
}, limit: number = 1): Promise<string[]> {
    let form: Form
    if (typeof data.form === 'string') {
        const _form = await getFormByUlid(data.form)
        if (_form) {
            form = _form
        } else {
            throw new Error(`Form ${_form} not found`)
        }
    } else {
        form = data.form
    }

    const linkData: Drizzle.PrepaidForms.insert[] = []
    for (let i = 0; i < limit; i++) {
        linkData.push({
            formUlid: form.forms.ulid,
            paymentUlid: data.formPaymentulid,
            token: v4()
        })
    }

    insertPrepaidLinkData(linkData)

    return linkData.map((linkDatum) => linkDatum.token)
}


export async function validateFormLinkToken(token: string) {
    const linkData = await getPrepaidFormLink(token)
    if (!linkData || !linkData.isValid) return false
    return linkData
}

export async function sendResponseInvites(invites: Array<{ email: string } | { phone: string }>, links: string[], baseMessage: string) {
    invites.forEach((invite, idx) => {
        const link = links[idx]
        if ((invite as { phone: string }).phone) {
            log.info((invite as { phone: string }).phone, invite)
        } else {
            sendUserMail({
                email: (invite as { email: string }).email
            }, baseMessage + link, "[Action Needed] Information Request")
        }
    })
}
