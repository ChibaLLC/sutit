import { getFormResponses } from "./utils/queries";
import { constructExcel } from "./utils";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid) {
		throw createError({
			statusCode: 400,
			message: "No form ID provided",
		});
	}

	const { user } = await useAuth(event);

	const submissions = await getFormResponses(formUlid);

	const excel = await constructExcel(submissions, user);

	return new Response(await excel.writeBuffer(), {
		headers: {
			"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": `attachment; filename=${formUlid}.xlsx`,
		},
	});
});
