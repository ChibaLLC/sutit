import { H3Event } from "h3"
import { WhatsAppWeb } from "~/server/utils/classes";
import storage from "~/storage";
import { Status, type APIResponse, type CloudAPI, type OnPremisesAPI } from "~/types";

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

    useFileLogger(body, { type: "info", tag: "whatsapp/webhook" })

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
        useFileLogger(e, { type: "error", tag: "whatsapp/webhook" })
    })

    return {
        statusCode: 200,
        body: "OK"
    } as APIResponse
}))

router.get("/webhook", defineEventHandler((event) => {
    let query = getQuery(event)
    let mode = query["hub.mode"]
    let token = query["hub.verify_token"]
    let challenge = query["hub.challenge"]

    if (!mode || !token || !challenge) return useHttpEnd(event, null, 403)

    if (mode !== "subscribe" || token !== process.env.WHATSAPP_TOKEN) return useHttpEnd(event, null, 403)

    useFileLogger("Webhook verified", { type: "info", tag: "whatsapp/webhook" })
    return event.respondWith(new Response(challenge as string, { status: 200, headers: { "Content-Type": "text/plain" } }))
}))

router.get("/create-instance", defineEventHandler(async (event) => {
    const details = await useAuth(event).catch((e) => {
        useHttpEnd(event, {
            statusCode: Status.unauthorized,
            body: "You need to log in to access this page"
        }, 401)
    })
    if (!details) return {
        statusCode: Status.notFound,
        body: "User not found"
    }

    const instance = await storage.getItem<WhatsAppWeb>(`whatsapp_instance_${details.user.id}`)
    if (instance) {
        instance.start(useSSE(event))
    } else {
        const whatsApp = new WhatsAppWeb(details.user.id)
        storage.setItem<WhatsAppWeb>(`whatsapp_instance_${details.user.id}`, whatsApp)
        whatsApp.start(useSSE(event))
    }
}))

export default useController("whatsapp", router)