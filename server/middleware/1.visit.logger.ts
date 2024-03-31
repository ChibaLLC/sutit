import {H3Event} from "h3";
export default defineEventHandler((context: H3Event) => {
    log.info(`[${context.node.req.method}]\t${context.node.req.url}`)
})