import {H3Event} from "h3";
import { useFileLogger } from "~/utils/logger";
export default defineEventHandler((context: H3Event) => {
    useFileLogger(`[${context.node.req.method}] ${context.node.req.url}`, {type: 'info'})
})