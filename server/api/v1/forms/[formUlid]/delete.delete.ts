import { deleteUserForm } from "../utils";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid) {
		return createError({
			status: 400,
			message: "No formUlid provided",
		});
	}

	const { user } = await useAuth(event);

	const result = await deleteUserForm(user.ulid, formUlid).catch((e: Error) => e);
	if (result instanceof Error) {
		return createError({
			status: 500,
			data: result,
			message: result.message,
		});
	}

	return createResponse({
		statusCode: 200,
		statusMessage: "OK",
	});
});
