import { revokeAuthToken } from "~~/server/api/auth/utils";
import { createUser } from "~~/server/api/users/utils/queries";
import { authenticate } from "~~/server/api/auth/utils/queries";
import { z } from "zod";

export default defineEventHandler(async (event) => {
	const schema = z.object({
		name: z.string().optional(),
		password: z.string(),
		email: z.string().email(),
	});
	const { data, error } = await readValidatedBody(event, schema.safeParse);
	if (error) {
		throw createError({
			statusCode: 400,
			message: error.message,
			data: error,
		});
	}
	await revokeAuthToken(event);
	await createUser(data)
	return authenticate({ email: data.email, password: data.password })
});
