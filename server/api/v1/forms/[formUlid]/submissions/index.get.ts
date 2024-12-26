import { getFormResponses } from "./utils/queries";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid)
		throw createError({
			status: 400,
			message: "No form ID provided",
		});

	const { user } = await useAuth(event);
	const { form, ...rest } = await getFormResponses(formUlid);
	if (form.meta.userUlid !== user.ulid) {
		throw createError({
			statusCode: 403,
			message: "You are not authorised to vie these submissions",
		});
	}
	return {
		form,
		...rest,
	};
});
