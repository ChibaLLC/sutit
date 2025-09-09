import { auth } from "~~/server/lib/auth";
import { createForm } from "~~/server/services/form.service";
import { FormSchema } from "~~/shared/types";

export default defineEventHandler(async (event) => {
	try {
		const session = await auth.api.getSession({
			headers: event.headers,
		});
		if (!session) {
			throw createError({
				status: 401,
				message: "Unauthorized",
			});
		}

		const body = (await readBody(event)) as FormSchema;
		body.createdBy = session.user.id;
		const form = await createForm(body);
		return {
			data: form,
			message: "Form created successfully",
		};
	} catch (e) {
		console.log(e);
		throw createError({
			status: 500,
			message: e.message || "An error occurred",
		});
	}
});
