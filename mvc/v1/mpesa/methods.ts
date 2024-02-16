import {Mpesa} from "daraja.js";

const app = new Mpesa({
    consumerKey: process.env.MPESA_APP_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_APP_CONSUMER_SECRET!,
    initiatorPassword: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
})

export async function call_stk(phone_number: number, amount: number, description: string) {
    const response = await app
        .stkPush()
        .amount(amount)
        .phoneNumber(phone_number)
        .description(description)
        .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
        .callbackURL(process.env.MPESA_CALLBACK_URL!)
        .send()

    if(!response.isOkay()) {
        console.error(response)
        return null
    }
    return response.data
}