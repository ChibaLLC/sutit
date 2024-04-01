import {H3Event} from "h3";
export default defineEventHandler((context: H3Event) => {
    if(!isVercel) log.info(`[${context.node.req.method}]\t${context.node.req.url}`)
})