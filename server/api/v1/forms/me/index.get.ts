import { getFormsByUser } from "../utils/queries";

export default defineEventHandler(async (event) => {
	const { user } = await useAuth(event);

	const forms = await getFormsByUser(user.ulid).catch((err) => err as Error);
	if (forms instanceof Error) {
		throw createError({
			statusCode: 500,
			message: forms.message,
		});
	}

	return forms;
});
