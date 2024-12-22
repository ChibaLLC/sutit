import { getInviteFormGroup, insertData, invalidateFormGroupLink, needsIndividualPayment } from "../utils/queries";
import { getUserByUlId } from "~~/server/api/v1/users/utils/queries";
import { generateReceiptNumber, processFormPayments, sendPaymentMailReceipt, sendUserMail } from "../utils";
import { z } from "zod";
import type { EmailInvite, PhoneInvite } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
	const formUlid = event.context.params?.formUlid;
	if (!formUlid) {
		throw createError({
			statusCode: 400,
			message: "No form ID provided",
		});
	}

	const schema = z.object({
		form: z.object({
			meta: z.custom<Drizzle.SutitForm[number]["form_meta"]>(
				(data: Drizzle.SutitForm[number]["form_meta"]) => !!data.ulid
			),
			pages: z.custom<Record<number, DbPage>>((data: Record<number, DbPage>) => {
				return Object.values(data).some((page) => page.some((element) => !!element.fieldUlid));
			}),
			stores: z.custom<Record<number, DbStore>>((data: Record<number, DbStore>) => {
				return Object.values(data).some((store) => store.some((item) => !!item.itemUlid));
			}),
		}),
		phone: z.string().optional(),
		token: z.string().optional(),
	});

	var { data, error } = await readValidatedBody(event, schema.safeParse);
	if (error || !data) {
		throw createError({
			statusCode: 400,
			message: error?.message,
			data: error,
		});
	}

	const [form, needsPay] = await needsIndividualPayment(formUlid, data.form.meta.price_individual);
	if (needsPay && !data.phone && !data.token) {
		throw createError({
			statusCode: 400,
			message: "We need a phone number or a payment token to complete this transaction",
		});
	}

	if (form.meta.requireMerch && !hasBoughtMerch(data.form.stores)) {
		throw createError({
			statusCode: 403,
			message: "You need to get something from the store section of the form",
		});
	}

	const creator = await getUserByUlId(form.meta.userUlid);
	if (!creator) {
		throw createError({
			statusCode: 500,
			message: "Form Creator Not Found",
		});
	}

	const [details] = await useAuth(event, false);
	const commit = async (options: { invitee?: PhoneInvite | EmailInvite; price_paid?: number }) => {
		if (!data) return {};
		let formMail = (options.invitee as { email: string })?.email || details?.user.email;
		if (!formMail) {
			for (const key in data.form.pages) {
				for (const field of data.form.pages[key] || []) {
					if (isInput(field) && field.type === Field.EMAIL) {
						formMail = field.value as string | undefined;
						break;
					}
				}
			}
		}
		const formResponse = await insertData(formUlid, data.form, options.price_paid);
		sendUserMail(
			{ email: creator.email },
			`New response on form ${data.form.meta.formName}`,
			`[Update] Submission ${data.form.meta.formName}`
		);
		if (formMail) {
			sendUserMail(
				{ email: formMail },
				`Form submission successful for ${data.form.meta.formName}`,
				`[Update] Successful form submission ${data.form.meta.formName}`
			);
		}

		return { formMail, formResponse };
	};

	if (needsPay && !data.token && data.phone) {
		if (data.form.meta.price_individual < data.form.meta.price_individual) {
			return useHttpEnd(event, {
				statusCode: 400,
				body: "Passed price is less than the allowed minimum for this form",
			});
		}
		return await processFormPayments(
			data.form.meta,
			{
				phone: data.phone,
				amount: data.form.meta.price_individual,
				accountNumber: creator?.email || creator?.name || "Unknown",
			},
			async (payment) => {
				const receiptNumber = generateReceiptNumber(payment);
				const { formMail } = await commit({ price_paid: payment.amount });
				if (formMail) {
					sendPaymentMailReceipt({ email: formMail }, form.meta.price_individual, receiptNumber);
					sendUserMail(
						{ email: formMail },
						`Payment successful for ${form.meta.formName}`,
						`[Update]: Payment Successful ${form.meta.formName}`
					);
				}
			}
		);
	} else if (needsPay && data.token) {
		const { invite } = await getInviteFormGroup(formUlid, data.token);
		if (!invite) {
			throw createError({
				statusCode: 403,
				message: "The provided token is not valid",
			});
		}

		const result = await commit({ invitee: invite });
		invalidateFormGroupLink(invite.token, invite.token);
		return result;
	} else if (!needsPay) {
		return commit({});
	} else {
		throw createError({ statusCode: 400 });
	}
});
