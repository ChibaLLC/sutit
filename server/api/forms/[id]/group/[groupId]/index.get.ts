import { getGroupById } from "~~/server/services/group.service";

export default defineEventHandler(async (event) => {
	const params = getRouterParams(event);
	if (!params.id && !params.groupId) {
		throw createError({
			statusCode: 404,
			message: "Form ID and Group ID are required",
		});
	}
	const group = await getGroupById(params.groupId);
	if (!group) {
		throw createError({
			statusCode: 404,
			message: "Not Found",
		});
	}

	return {
		data: group,
		success: true,
	};
});
