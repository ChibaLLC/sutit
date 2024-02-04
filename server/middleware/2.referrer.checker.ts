import type {H3Event} from "h3";

export default defineEventHandler((context: H3Event) => {
    const referrer = context.node.req.headers?.referer || null

    if (!referrer && context.node.req.url === '/') {
        return useHttpEnd(context, "No referrer provided", 403)
    }
})