import { revokeAuthToken } from "~~/server/api/auth/utils";
import { authenticate } from "~~/server/api/auth/utils/queries";
import { z } from "zod";
export default defineEventHandler(async (event) => {
	const schema = z.object({
		password: z.string(),
		email: z.string(),
	});
	const { data, error } = await readValidatedBody(event, schema.safeParse);
	if (error) {
		throw createError({
			statusCode: 400,
			data: error,
			message: error.message,
		});
	}

	await revokeAuthToken(event);
	return authenticate({ email: data.email, password: data.password });
});
