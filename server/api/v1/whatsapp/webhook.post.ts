import type {APIResponse, CloudAPI, OnPremisesAPI} from "~/types";

function typeData(data: any): { type: "cloud_api", data: CloudAPI } | { type: "on_premises_api", data: OnPremisesAPI } {
    if ("object" in data && data.object === "whatsapp_business_account") {
        return { type: "cloud_api", data };
    } else if ("contacts" in data && "messages" in data) {
        return { type: "on_premises_api", data };
    } else {
        throw new Error("Invalid data type");
    }
}

export default defineEventHandler(async event => {
    const body = await readBody(event)

    log.info(body, {tag: "whatsapp/webhook" })

    const data = typeData(body)

    const phone_number_id = data.type === "cloud_api" ? data.data.entry[0].changes[0].value.metadata.phone_number_id : "phone_number_id";
    const from = data.type === "cloud_api" ? data.data.entry[0].changes[0].value.messages[0].from : data.data.messages[0].from;
    const message_body = data.type === "cloud_api" ? data.data.entry[0].changes[0].value.messages[0].text.body : data.data.messages[0].text.body;

    $fetch(`https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${process.env.WHATSAPP_TOKEN}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
                body: "Ack: " + message_body
            }
        })
    }).catch((e) => {
        log.info(e, { tag: "whatsapp/webhook" })
    })

    return {
        statusCode: 200,
        body: "OK"
    } as APIResponse
})