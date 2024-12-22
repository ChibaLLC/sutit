import { z } from "zod";
import { getFormByUlid, createFormGroup, needsGroupPayment } from "../utils/queries";
import { getUserByUlId } from "~~/server/api/v1/users/utils/queries";
import { processFormPayments, sendResponseInvites, sendUserMail } from "../utils";

export default defineEventHandler(async (event) => {
	const { data: formUlid, error: _error } = z.string().safeParse(event.context.params?.formUlid);
	if (!formUlid) {
		throw createError({
			status: 400,
			message: "Form Ulid not provided",
			data: _error,
		});
	}

	const schema = z.object({
		invites: z.array(z.union([z.object({ email: z.string() }), z.object({ phone: z.string() })])),
		phone: z.string(),
		origin: z.string(),
		group_name: z.string(),
	});
	const { data, error } = await readValidatedBody(event, schema.safeParse);
	if (!data || error) {
		return createError({
			data: error,
			status: 400,
			message: error.message || "An unknown body parse error",
		});
	}

	const form = await getFormByUlid(formUlid).catch((e) => e as Error);
	if (!form || form instanceof Error) {
		return createError({
			status: 404,
			message: "Form Not Found",
		});
	}
	if (form.form_meta.price_group && form.form_meta.group_member_count) {
		if (data.invites.length > form.form_meta.group_member_count)
			return createError({
				status: 403,
				message: "Sorry, these group members are more than the allowed number",
			});
	}

	const amount = form.form_meta.price_group
		? form.form_meta.price_group
		: form.form_meta.price_individual * data.invites.length;

	const [_, needsPay] = await needsGroupPayment(form, amount);
	const message = form.form_meta.group_invite_message?.padEnd(1, " ");
	const links = (group: Awaited<ReturnType<typeof createFormGroup>>) => {
		return (
			group.invites?.map((invite) => `${data.origin}/forms/${form.form_meta.ulid}?token=${invite.token}`) || []
		);
	};

	if (needsPay) {
		const creator = await getUserByUlId(form.form_meta.userUlid);
		if (creator instanceof Error) {
			throw createError({
				status: 404,
				message: "Form creator not found",
			});
		}

		const accountNumber = creator?.email || creator?.name || "Unknown";
		return await processFormPayments(
			form.form_meta,
			{
				accountNumber,
				phone: data.phone,
				amount: amount,
			},
			async (payment) => {
				const group = await createFormGroup({
					formUlid: form.form_meta.ulid,
					groupName: data.group_name,
					invites: data.invites,
					paymentUlid: payment.ulid,
				});
				sendResponseInvites(data.invites, links(group), message);
				sendUserMail(
					{ email: creator!.email },
					`Group ${data.group_name} has paid for form ${form.form_meta.formName} and was processesed successfully`,
					`[Payment]: Group ${form.form_meta.formName}`
				);
			}
		);
	} else {
		const group = await createFormGroup({
			formUlid: form.form_meta.ulid,
			groupName: data.group_name,
			invites: data.invites,
			paymentUlid: null,
		});
		sendResponseInvites(data.invites, links(group), message);
		return {
			statusCode: 204,
			body: "OK",
		};
	}
});
