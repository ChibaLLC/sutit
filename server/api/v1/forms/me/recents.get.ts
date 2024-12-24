import { getRecentForms } from "~~/server/api/v1/users/utils/queries";

export default defineEventHandler(async (event) => {
	const { user } = await useAuth(event);

	const forms = await getRecentForms(user.ulid).catch((e) => e as Error);
	if (forms instanceof Error) {
		throw createError({
			statusCode: 500,
			message: forms.message,
		});
	}

	return forms;
});
