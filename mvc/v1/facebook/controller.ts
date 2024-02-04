import { H3Event } from "h3"
import type { CloudAPI, OnPremisesAPI } from "~/types";
const router = createRouter()

function typeData(data: any): { type: "cloud_api", data: CloudAPI } | { type: "on_premises_api", data: OnPremisesAPI } {
    if ("object" in data && data.object === "whatsapp_business_account") {
        return { type: "cloud_api", data };
    } else if ("contacts" in data && "messages" in data) {
        return { type: "on_premises_api", data };
    } else {
        throw new Error("Invalid data type");
    }
}

router.post("/webhook", defineEventHandler(async (event: H3Event) => {
    const body = await readBody(event)

    useFileLogger(body, { type: "info", tag: "facebook/webhook" })

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
        useFileLogger(e, { type: "error", tag: "facebook/webhook" })
    })

    return useHttpResponse(event, "Ok")
}))

router.get("/webhook", defineEventHandler((event) => {
    let query = getQuery(event)
    let mode = query["hub.mode"]
    let token = query["hub.verify_token"]
    let challenge = query["hub.challenge"]

    if (!mode || !token || !challenge) return useHttpEnd(event, null, 403)

    if (mode !== "subscribe" || token !== process.env.WHATSAPP_TOKEN) return useHttpEnd(event, null, 403)

    useFileLogger("Webhook verified", { type: "info", tag: "facebook/webhook" })
    return useHttpResponse(event, challenge, 200)
}))


export default useController("facebook", router)