import { updateForm } from "../utils/queries";
import { formUpdateSchema } from "../utils/zod";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid) {
		throw createError({
			statusCode: 400,
			message: "No form ID provided",
		});
	}

	const { user } = await useAuth(event);
	const { data, error } = await readValidatedBody(event, formUpdateSchema.safeParse);
	if (!data || error) {
		throw createError({
			statusCode: 400,
			data: error,
		});
	}

	const form_meta = await updateForm(data, user);
	return form_meta;
});
