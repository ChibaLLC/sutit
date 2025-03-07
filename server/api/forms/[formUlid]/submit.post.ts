import { getInviteFormGroup, insertData, invalidateFormGroupLink, needsIndividualPayment } from "../utils/queries";
import { getUserByUlId } from "~~/server/api/users/utils/queries";
import { generateReceiptNumber, hasInfiniteStock, parseStock, processFormPayments, sendPaymentMailReceipt, sendUserMail } from "../utils";
import { z } from "zod";
import type { EmailInvite, PhoneInvite } from "~~/server/db/schema";
import { generateStoreTable, sendUserReceipt } from "../utils/email";
import type { Item } from "@chiballc/nuxt-form-builder";

function validateOrders(
	items: Record<
		string,
		{
			name: string;
			qtty: string | number;
			liked: boolean;
			carted: boolean;
			stock: string | number;
		}
	>
) {
	Object.values(items || {})?.forEach((item) => {
		// TODO: Check from the db instead or cache
		if(hasInfiniteStock(item as Item)) return
		item.stock = parseStock(item as Item)
		if (+item.qtty > +item.stock) {
			throw createError({
				message: `Requested quanty: ${item.qtty} is less than the available stock: ${item.stock}`,
			});
		}
	});
}

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
			meta: z.custom<Drizzle.SutitForm["form_meta"]>((data: Drizzle.SutitForm["form_meta"]) => !!data?.ulid),
			pages: z.record(z.string(), z.any()),
			stores: z.record(
				z.string(),
				z.object({
					name: z.string(),
					qtty: z.union([z.string(), z.number()]),
					liked: z.boolean(),
					carted: z.boolean(),
					stock: z.union([z.string(), z.number()]),
					price: z.union([z.string(), z.number()]),
				})
			),
		}),
		phone: z.string().optional(),
		token: z.string().optional(),
	});

	var { data, error } = await readValidatedBody(event, schema.safeParse);
	if (error || !data) {
		throw createError({
			statusCode: 400,
			message: error?.message,
			data: { error, data: await readBody(event) },
		});
	}

	const [form, needsPay] = await needsIndividualPayment(formUlid, data.form.meta.price_individual);
	if (needsPay && !data.phone && !data.token) {
		throw createError({
			statusCode: 400,
			message: "We need a phone number or a payment token to complete this transaction",
		});
	}

	if (form.meta.requireMerch && !Object.keys(data.form?.stores || {}).length) {
		throw createError({
			statusCode: 403,
			message: "You need to get something from the store section of the form",
		});
	}

	validateOrders(data.form?.stores);

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
			for (const key in data.form.pages || {}) {
				for (const field of data.form.pages[key] || []) {
					if (field.type === Field.EMAIL) {
						formMail = field.value as string;
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
		if (data.form.meta.price_individual < form.meta.price_individual) {
			throw createError({
				statusCode: 400,
				message: "Passed price is less than the allowed minimum for this form",
				data: {
					form: form.meta,
					data,
				},
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

				let formData = {
					name: data?.phone,
					phoneNumber: data?.phone,
					receiptNumber: receiptNumber,
					date: new Date().toLocaleTimeString(),
					products: generateStoreTable(data?.form.stores),
				};
				if (formMail) {
					await sendUserReceipt(formMail, formData, "receipt");
					await sendPaymentMailReceipt({ email: formMail }, payment.amount, receiptNumber);
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
