import { getFormGroups } from "~~/server/services/group.service";

export default defineEventHandler(async (event) => {
	const formId = getRouterParam(event, "id");
	if (!formId) {
		throw createError({
			statusCode: 404,
			message: "Form ID required",
		});
	}
	const form = await getFormGroups(formId);

	return {
		data: form,
		success: true,
	};
});
