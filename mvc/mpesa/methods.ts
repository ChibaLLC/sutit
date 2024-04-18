import { Mpesa } from "daraja.js";

const app = new Mpesa({
    consumerKey: process.env.MPESA_APP_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_APP_CONSUMER_SECRET!,
    initiatorPassword: process.env.MPESA_PASSKEY!,
    organizationShortCode: +process.env.MPESA_BUSINESS_SHORTCODE!,
},
    isDevelopment ? "sandbox" : "production"
)

export async function call_stk(phone_number: number, amount: number, description: string, accountNumber: string) {
    const response = await app
        .stkPush()
        .amount(amount)
        .phoneNumber(phone_number)
        .description(description)
        .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
        .accountNumber(accountNumber)
        .callbackURL(process.env.MPESA_CALLBACK_URL!)
        .lipaNaMpesaPassKey(process.env.MPESA_LNM_PASSKEY!)
        .send()
        .catch(err => {
            console.error(err)
            return null
        })

    if (!response || !response.isOkay()) {
        console.error(response)
        return null
    }
    return response.data
}