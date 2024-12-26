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
	await deleteUserForm(user.ulid, formUlid)
	return createResponse({
		statusCode: 200,
		statusMessage: "OK",
	});
});
