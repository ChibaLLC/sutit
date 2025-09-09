import { auth } from "~~/server/lib/auth";
import { getUserForms } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
	try {
		const session = await auth.api.getSession({
			headers: event.headers,
		});
		if (!session) {
			throw createError({
				statusCode: 401,
				message: "Unauthenticated",
			});
		}
		const forms = await getUserForms(session.user.id);
		return {
			message: "Success",
			data: forms,
		};
	} catch (e) {
		throw createError({
			statusCode: 500,
			message: "An error occurred",
		});
	}
});
