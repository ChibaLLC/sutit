export default defineEventHandler((context) => {
	if (!isVercel) log.info(`[${context.node.req.method}]   ${context.node.req.url}`);
});
