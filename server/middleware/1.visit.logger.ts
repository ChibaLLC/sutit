import type { H3Event } from "h3";

export default defineEventHandler((context) => {
	if (!isVercel) log.info(`[${context.node.req.method}]   ${context.node.req.url}`);
});
