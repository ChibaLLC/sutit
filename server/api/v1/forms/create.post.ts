import {createForm} from "./utils/queries"
import { formBodyData } from "./utils/zod";

export default defineEventHandler(async (event) => {
	const details = await useAuth(event);
	const { data, error } = await readValidatedBody(event, formBodyData.safeParse);
	if (!data || error) {
		throw createError({
			statusCode: 400,
			data: error,
		});
	}
	const form_meta = await createForm(data, details).catch((err) => {
		log.error(err);
		throw createError({
			message: err.message || "Unknown error occurred while creating the form",
			statusCode: 500,
		});
	});

	return form_meta;
});