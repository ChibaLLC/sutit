import {
	getInviteFormGroup,
	insertData,
	insertGroupResponse,
	invalidateFormGroupLink,
	needsIndividualPayment,
} from "../utils/queries";
import { getUserByUlId } from "~~/server/api/users/utils/queries";
import {
	generateReceiptNumber,
	hasInfiniteStock,
	parseStock,
	processFormPayments,
	sendPaymentMailReceipt,
	sendUserMail,
} from "../utils";
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
	>,
) {
	Object.values(items || {})?.forEach((item) => {
		// TODO: Check from the db instead or cache
		if (hasInfiniteStock(item as Item)) return;
		item.stock = parseStock(item as Item);
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
			pages: z.array(
				z.object({
					type: z.string().nullable(),
					ulid: z.string().nullable(),
					index: z.number().nullable(),
					label: z.string().nullable(),
					pageUlid: z.string().nullable(),
					inputType: z.string().nullable(),
					description: z.string().nullable(),
					placeholder: z.string().nullable(),
					value: z.any(),
				}),
			),
			stores: z.record(
				z.string(),
				z.object({
					name: z.string(),
					qtty: z.union([z.string(), z.number()]),
					liked: z.boolean(),
					carted: z.boolean(),
					stock: z.union([z.string(), z.number()]),
					price: z.union([z.string(), z.number()]),
				}),
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
	const commit = async (options: { invitee?: PhoneInvite | EmailInvite; price_paid?: number; group?: object }) => {
		if (!data) return {};
		let formMail = (options.invitee as { email: string })?.email || details?.user.email;
		if (!formMail) {
			for (let i = 0; i < data.form.pages.length; i++) {
				const field = data.form.pages[i];
				if (field.type == Field.EMAIL) {
					formMail = field.value as string;
					break; // This will exit the loop immediately
				}
			}
		}
		const formResponse = await insertData(formUlid, data.form, options.price_paid);
		if (options.invitee && options.group) {
			await insertGroupResponse(formUlid, formResponse.ulid, options.group.ulid);
		}
		sendUserMail(
			{ email: creator.email },
			`New response on form ${data.form.meta.formName}`,
			`[Update] Submission ${data.form.meta.formName}`,
		);
		if (formMail) {
			sendUserMail(
				{ email: formMail },
				`Form submission successful for ${data.form.meta.formName}`,
				`[Update] Successful form submission ${data.form.meta.formName}`,
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
					formName: data.form.meta.formName,
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
			},
		);
	} else if (needsPay && data.token) {
		const { invite, group } = await getInviteFormGroup(formUlid, data.token);

		if (!invite) {
			throw createError({
				statusCode: 403,
				message: "The provided token is not valid",
			});
		}
		if (!invite.isValid) {
			throw createError({
				statusCode: 403,
				message: "The provided token has already been used!",
			});
		}
		// Calculate Total Amount in stores
		function calculateTotalAmount(stores: Record<string, any>): number {
			return Object.values(stores).reduce((total, store) => {
				const price = typeof store.price === "string" ? parseFloat(store.price) : store.price;
				const quantity = typeof store.qtty === "string" ? parseFloat(store.qtty) : store.qtty;
				const amount = (isNaN(price) ? 0 : price) * (isNaN(quantity) ? 0 : quantity);
				return total + amount;
			}, 0);
		}
		console.log("Total store amount:", calculateTotalAmount(data.form.stores));
		// Gather Store Details
		let details = {
			phone: data.phone,
			amount: calculateTotalAmount(data.form.stores),
			accountNumber: creator?.email || creator?.name || "Unknown",
		};
		return await processFormPayments(data.form.meta, details, async (payment) => {
			const receiptNumber = generateReceiptNumber(payment);

			const { formMail } = await commit({ price_paid: payment.amount, invitee: invite, group: group });

			let formData = {
				formName: data.form.meta.formName,
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
			await invalidateFormGroupLink(formUlid, invite.token);
		});

		// const result = await commit({ invitee: invite, group: group });
		// let t = await invalidateFormGroupLink(formUlid, invite.token);
		// return result;
	} else if (!needsPay && data.token) {
		const { invite, group } = await getInviteFormGroup(formUlid, data.token);

		if (!invite) {
			throw createError({
				statusCode: 403,
				message: "The provided token is not valid",
			});
		}
		if (!invite.isValid) {
			throw createError({
				statusCode: 403,
				message: "The provided token has already been used!",
			});
		}
		const result = await commit({ invitee: invite, group: group });
		let t = await invalidateFormGroupLink(formUlid, invite.token);
		console.log(t);
		return result;
	} else if (!needsPay) {
		return commit({});
	} else {
		throw createError({ statusCode: 400 });
	}
});
