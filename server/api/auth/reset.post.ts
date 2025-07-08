import { getUserByEmail } from "~~/server/api/users/utils/queries";
import { resetPassword } from "~~/server/api/auth/utils";
import { authenticate } from "~~/server/api/auth/utils/queries";
import { z } from "zod";

const query_schema = z.object({
	email: z.string(),
	token: z.string(),
});
const body_schema = z.object({
  password: z.string(),
  origin: z.string(),
});
export default defineEventHandler(async (event) => {
	const { data: query, error: qError } = await getValidatedQuery(event, query_schema.safeParse);
	if (qError) {
		throw createError({
			statusCode: 400,
			message: qError.message,
			data: qError,
		});
	}
	
	const { data: body, error } = await readValidatedBody(event, body_schema.safeParse);
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
