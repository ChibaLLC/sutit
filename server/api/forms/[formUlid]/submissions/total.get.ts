import { getFormByUlid, getFormPaymentsSum } from "~~/server/api/forms/utils/queries";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid) {
		throw createError({
			statusCode: 400,
			message: "No form ID provided",
		});
	}

	const { user } = await useAuth(event);

	const form = await getFormByUlid(formUlid);
	if (!form) {
		throw createError({
			statusCode: 404,
			message: "Form not found",
		});
	}

	if (form.meta.userUlid !== user.ulid) {
		throw createError({
			statusCode: 400,
			message: "Unauthorized",
		});
	}

	return getFormPaymentsSum(formUlid);
});
