import { getFormByUlid } from "~~/server/api/v1/forms/utils/queries";

export default defineEventHandler(async (event) => {
	const formUuid = getRouterParam(event, "formUlid");
	if (!formUuid) {
		throw createError({
			statusCode: 400,
			message: "No form ID provided",
		});
	}

	const form = await getFormByUlid(formUuid);
	if (!form) {
		throw createError({
			statusCode: 404,
			message: "No form with the ID provided was found",
		});
	}

	return form;
});
