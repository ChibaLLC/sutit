import { getFormById } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	if (!id) {
		throw createError({
			status: 404,
			statusCode: 404,
			message: "Not Found",
		});
	}
	let data = await getFormById(id);
	return {
		...data,
	};
});
