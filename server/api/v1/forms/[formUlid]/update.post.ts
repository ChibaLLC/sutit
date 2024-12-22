import { updateForm } from "../utils/queries";
import { formUpdateSchema } from "../utils/zod";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid)
		return useHttpEnd(
			event,
			{
				statusCode: Status.badRequest,
				body: "No form ID provided",
			},
			Status.badRequest
		);

	const { user } = await useAuth(event);
	const { data, error } = await readValidatedBody(event, formUpdateSchema.safeParse);
	if (!data || error) {
		throw createError({
			statusCode: 400,
			data: error,
		});
	}    

	const form_meta = await updateForm(data, user).catch((err) => {
		log.error(err);
		throw createError({
			message: err.message || "Unknown error occurred while updating the form",
			statusCode: Status.internalServerError,
		});
	});

	return form_meta;
});
