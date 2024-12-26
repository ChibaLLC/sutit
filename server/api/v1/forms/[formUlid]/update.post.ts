import { updateForm } from "../utils/queries";
import { formBodyData } from "../utils/zod";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid) {
		throw createError({
			statusCode: 400,
			message: "No form ID provided",
		});
	}

	const { user } = await useAuth(event);
	const { data, error } = await readValidatedBody(event, formBodyData.safeParse);
	if (error) {
		throw createError({
			statusCode: 400,
			data: { error, data: await readBody(event) },
		});
	}

	const form_meta = await updateForm(formUlid, data, user);
	return form_meta;
});
