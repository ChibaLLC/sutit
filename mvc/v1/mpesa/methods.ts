import { DarajaLinks, type MpesaStkRequest, MpesaTransactionType } from "~/types";
import storage from "~/storage";

export async function call_stk(phone_number: number, amount: number, description: string) {
    const time = new Date().toISOString()
    const timestamp = time.replace(/[^0-9]/g, "")
    let accessToken = await storage.getItem<{
        access_token: string
        expires_in: number
        time: string
    }>("mpesa_api_access_token")

    if (!accessToken || (new Date().getTime() - new Date(accessToken.time).getTime()) / 1000 > accessToken.expires_in) {
        const authorisation = Buffer.from(`${process.env.MPESA_CONSUMER_KEY!}:${process.env.MPESA_CONSUMER_SECRET!}`).toString("base64")
        const res = await $fetch<{
            access_token: string
            expires_in: number
        }>(DarajaLinks.OAuth_Access_Token + "client_credentials", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authorisation}`
            }
        }).catch(err => {
            console.error(err)
            throw new Error("Failed to get access token")
        })

        if (!res || res.access_token) throw new Error("Failed to get access token")
        await storage.setItem("mpesa_api_access_token", {
            access_token: res.access_token,
            expires_in: res.expires_in,
            timestamp: timestamp
        })

        accessToken = {
            access_token: res.access_token,
            expires_in: res.expires_in,
            time: time
        }
    }

    const request = {
        BusinessShortCode: parseInt(process.env.MPESA_BUSINESS_SHORTCODE!),
        Password: Buffer.from(`${process.env.MPESA_BUSINESS_SHORTCODE!}${process.env.MPESA_PASSKEY!}${timestamp}`).toString("base64"),
        Timestamp: timestamp,
        TransactionType: MpesaTransactionType.CustomerPayBillOnline,
        Amount: amount,
        PartyA: parseInt(process.env.MPESA_B2C_PARTY_A!),
        PartyB: parseInt(process.env.MPESA_B2C_PARTY_B!),
        PhoneNumber: phone_number,
        CallBackURL: process.env.MPESA_CALLBACK_URL!,
        AccountReference: process.env.MPESA_B2C_ACCOUNT_REF!,
        TransactionDesc: description
    } satisfies MpesaStkRequest

    const response = await $fetch(process.env.MPESA_STK_URL!, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: request
    })
}