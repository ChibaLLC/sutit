import { githubAuth } from "~~/server/api/auth/utils";

export default defineEventHandler(async (event) => {
	const { code } = getQuery(event);
	if (!code) {
		throw createError({
			statusCode: 400,
			message: "Code is required",
		});
	}
	const token = await githubAuth(code.toString());

	setCookie(event, "auth", token);
	return sendRedirect(event, `/dashboard`);
});
