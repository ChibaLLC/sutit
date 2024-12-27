import { getRecentForms } from "~~/server/api/users/utils/queries";

export default defineEventHandler(async (event) => {
	const { user } = await useAuth(event);

	const forms = await getRecentForms(user.ulid).catch((e) => {
		throw createError({
			statusCode: 500,
			message: e.message,
		});
	});

	return forms;
});
