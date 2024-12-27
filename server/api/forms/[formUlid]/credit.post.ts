import { getFormByUlid } from "../utils/queries";
import { withdrawFunds } from "../utils";
import { z } from "zod";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid)
		throw createError({
			statusCode: 400,
			message: "No form ID provided",
		});

	const schema = z.union([
		z.object({
			paybill_no: z.string(),
			account_no: z.string(),
		}),
		z.object({
			till_no: z.string(),
		}),
		z.object({
			phone: z.string(),
		}),
	]);
	const { data, error } = await readValidatedBody(event, schema.safeParse);
	if (error) {
		throw createError({
			statusCode: 400,
			message: error.message,
			data: error,
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

	if (form.meta?.userUlid !== user.ulid) {
		throw createError({
			statusCode: 403,
			message: "This user did not create the form",
		});
	}

	const result = await withdrawFunds({
		formUlid,
		creditMethod: data,
		reason: "User Initiated Form Withdrawal",
		requester: user.ulid,
	});

	return "OK";
});
