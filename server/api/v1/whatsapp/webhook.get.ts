export default defineEventHandler(async event => {
    let query = getQuery(event)
    let mode = query["hub.mode"]
    let token = query["hub.verify_token"]
    let challenge = query["hub.challenge"]

    if (!mode || !token || !challenge) return useHttpEnd(event, null, 403)

    if (mode !== "subscribe" || token !== process.env.WHATSAPP_TOKEN) return useHttpEnd(event, null, 403)

    log.info("Webhook verified", { tag: "whatsapp/webhook" })
    return event.respondWith(new Response(challenge as string, { status: 200, headers: { "Content-Type": "text/plain" } }))
})