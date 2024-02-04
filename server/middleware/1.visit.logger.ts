import {H3Event} from "h3";
export default defineEventHandler((context: H3Event) => {
    useFileLogger(`[${context.node.req.method}]\t${context.node.req.url}`, {type: 'info'})
})