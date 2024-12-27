import { getFormsByUser } from "../utils/queries";

export default defineEventHandler(async (event) => {
	const { user } = await useAuth(event);

	const forms = await getFormsByUser(user.ulid).catch((err) => {
		throw createError({
			statusCode: 500,
			message: err.message,
		});
	})

	return forms;
});
