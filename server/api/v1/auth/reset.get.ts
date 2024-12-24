import { getUserByEmail } from "~~/server/api/v1/users/utils/queries";
import { createToken } from "~~/server/api/v1/auth/utils/queries";
import { z } from "zod";

export default defineEventHandler(async (event) => {
	const qSchema = z.object({
		email: z.string(),
		origin: z.string(),
		redirect: z.string().optional(),
	});
	const { data, error } = await getValidatedQuery(event, qSchema.safeParse);
	if (error) {
		throw createError({
			statusCode: 400,
			message: error.message,
			data: error,
		});
	}

	const { email, origin, redirect } = data;
	const user = await getUserByEmail(email);
	if (!user) {
		throw createError({
			statusCode: 404,
			message: "User not found",
		});
	}
	const token = await createToken({ userUlid: user.ulid, email: user.email });
	mailResetPasswordLink(email, origin, token, redirect);
	return "OK";
});
