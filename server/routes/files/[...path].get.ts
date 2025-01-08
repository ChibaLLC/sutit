export default defineEventHandler(async (event) => {
	const filepath = event.context.params?.path;
	const { stats, readableStream } = await $storage.file.getItem(filepath);
	if (!readableStream) {
		throw createError({
			message: `Requested file: ${filepath} not found`,
			statusCode: 404,
		});
	}

	return serveStatic(event, {
		getContents() {
			return readableStream;
		},
		getMeta() {
			return Promise.resolve(stats);
		},
	});
});
