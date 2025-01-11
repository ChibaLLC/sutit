export default defineEventHandler(async (event) => {
	let filepath = event.context.params?.path;
	if (!filepath) {
		throw createError({
			status: 400,
			message: "File Path Not Passed",
		});
	}
	
	filepath = decodeURIComponent(filepath);
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
			return stats;
		},
	});
});
