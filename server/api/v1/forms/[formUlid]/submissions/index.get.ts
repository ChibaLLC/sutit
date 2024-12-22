import { getFormResponses } from "./utils/queries";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid)
		throw createError({
			status: 400,
			message: "No form ID provided",
		});

	const { user } = await useAuth(event);
	const submissions = await getFormResponses(formUlid).catch((err) => err as Error);
	if (submissions instanceof Error)
		return useHttpEnd(
			event,
			{
				statusCode: Status.internalServerError,
				body: submissions.message || "Unknown error while getting form submissions",
			},
			Status.internalServerError
		);

	const response = {} as APIResponse<typeof submissions>;
	response.statusCode = Status.success;
	response.body = submissions;

	return response;
});
