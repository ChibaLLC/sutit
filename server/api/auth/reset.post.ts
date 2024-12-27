import { getUserByEmail } from "~~/server/api/users/utils/queries";
import { resetPassword } from "~~/server/api/auth/utils";
import { authenticate } from "~~/server/api/auth/utils/queries";
import { z } from "zod";

export default defineEventHandler(async (event) => {
	const qSchema = z.object({
		email: z.string(),
		token: z.string(),
	});
	const { data: query, error: qError } = await getValidatedQuery(event, qSchema.safeParse);
	if (qError) {
		throw createError({
			statusCode: 400,
			message: qError.message,
			data: qError,
		});
	}
	const shema = z.object({
		password: z.string(),
		origin: z.string(),
	});
	const { data: body, error } = await readValidatedBody(event, shema.safeParse);
	if (error) {
		throw createError({
			statusCode: 400,
			message: error.message,
			data: error,
		});
	}

	const user = await getUserByEmail(query.email);
	if (!user) {
		throw createError({
			statusCode: 404,
			message: "User not found",
		});
	}

	await resetPassword({ user, token: query.token, password: body.password });

	return authenticate({ email: user.email, password: body.password });
});
