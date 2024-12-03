import type { Drizzle } from "~~/server/db/types";
import { call_b2b, call_b2c, call_stk } from "~~/server/api/v1/mpesa/methods";
import { getUserByUlId } from "~~/server/api/v1/users/utils/queries";
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
} from "./queries";
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
        subject: subject,
    })
}

const PAYMENT_RECEIPT_HTML = (details: { user: { name: string, email: string }, amount: number | string, time: string, receiptNumber?: string }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        .receipt {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            width: 300px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .items {
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            padding: 10px 0;
        }
        .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        .total {
            margin-top: 10px;
            text-align: right;
        }
        .total .line {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        .total .line.final {
            font-weight: bold;
            border-top: 1px solid #ddd;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>SUTIT ORG</h1>            
            <h1>Name: ${details.user.name}</h1>
<p>Email: ${details.user.email}</p>
            <p>Date: ${details.time}</p>
            <p>Receipt #: ${details?.receiptNumber}</p>
        </div>
        <div class="items">
            <div class="item">
                <span>Payment </span>
                <span>KES ${details.amount}</span>
            </div>
        </div>
        <div class="total">            
            <div class="line final">
                <span>Total:</span>
                <span>KES ${details.amount}</span>
            </div>
        </div>
    </div>
</body>
</html>
`
}

export const sendPaymentMailReceipt = async (user: { userUlid?: string, email?: string }, amount: number | string, time: string, receiptNumber?: string) => {
    let email = user.email
    let name;
    if (!email) {
        const _user = await getUserByUlId(user.userUlid!)
        email = _user?.email
        name = _user?.name
    }
    if (!email) return log.warn("User has no email")
    if(!name) return log.warn("User has no name")
    let subject = "[Payment]: Payment Receipt for " + name

    return sendMail({
        to: email,
        subject: subject,
        html: PAYMENT_RECEIPT_HTML({
            user: { name: name, email: email },
            amount: amount,
            time: time,
            receiptNumber: receiptNumber
        })
    })

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

export async function sendResponseInvites(invites: Array<{ email: string } | { phone: string }>, links: string[], baseMessage?: string) {
    if (!baseMessage) baseMessage = "You have been invited to respond the the following form"
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


