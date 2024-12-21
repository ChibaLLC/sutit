import {
	formPayments,
	payments,
	formResponses,
	storeResponses,
	stores,
	formGroups,
	formGroupResponses,
	formMeta,
	formPages,
	storeItems,
	formFields,
	sutitForms,
	type PhoneInvite,
	type EmailInvite,
	type FormGroupInvite,
} from "~~/server/db/schema";
import db from "../../../../db";
import { type Drizzle } from "~~/server/db/types";
import { and, eq, desc, sum, count } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";
import type { Pages, Stores } from "@chiballc/nuxt-form-builder";
import { formCreateSchema, formUpdateSchema } from "./zod";

function insertFormFields(data: z.infer<typeof formUpdateSchema>) {
	const fieldsData: Drizzle.FormFields.insert[] = [];
	const pagesData: Drizzle.FormPages.insert[] = [];
	for (const index in data.form.pages) {
		const page = data.form.pages[index];
		const page_ulid = ulid();
		pagesData.push({
			formUlid: data.ulid,
			index: index,
			ulid: page_ulid,
		});
		page?.forEach((field) => {
			fieldsData.push({
				index: field.index,
				inputType: field.inputType as any,
				label: field.label || "Unlabeled",
				page: page_ulid,
				accept: field.accept,
				description: field.description,
				options: field.options,
				placeholder: field.placeholder,
				type: field.type,
			});
		});
	}

	db.insert(formPages)
		.values(pagesData)
		.execute()
		.then(() => {
			db.insert(formFields).values(fieldsData).execute;
		});

	const storeData: Drizzle.Store.insert[] = [];
	const itemsData: Drizzle.StoreItem.insert[] = [];
	for (const key in data.form.stores) {
		const store = data.form.stores[key];
		const store_ulid = ulid();
		storeData.push({
			formUlid: data.ulid,
			index: key,
			ulid: store_ulid,
		});
		store?.forEach((item) => {
			itemsData.push({
				name: item.name,
				price: item.price,
				images: item.images,
				quantity: item.qtty,
				index: item.index,
				store: store_ulid,
				storeUlid: store_ulid,
			});
		});
	}

	db.insert(stores)
		.values(storeData)
		.execute()
		.then(() => {
			db.insert(storeItems).values(itemsData).execute();
		});
}

export async function createForm(data: z.infer<typeof formCreateSchema>, { user }: AuthData) {
	const form = (
		await db
			.insert(formMeta)
			.values({
				allowGroups: data.allowGroups,
				group_invite_message: data.payment.group_message,
				group_member_count: data.payment.group_limit,
				price_group: data.payment.group_amount || undefined,
				price_individual: data.payment.amount || undefined,
				formName: data.name,
				ulid: ulid(),
				formDescription: data.description,
				userUlid: user.ulid,
			})
			.returning()
	).at(0);

	if (!form) throw new Error("Unable to create form");
	insertFormFields({ ...data, ulid: form.ulid });

	return form;
}

export async function updateForm(data: z.infer<typeof formUpdateSchema>) {
	const form = (
		await db
			.update(formMeta)
			.set({
				allowGroups: data.allowGroups,
				group_invite_message: data.payment.group_message,
				group_member_count: data.payment.group_limit,
				price_group: data.payment.group_amount || undefined,
				price_individual: data.payment.amount || undefined,
				formName: data.name,
				ulid: ulid(),
				formDescription: data.description,
			})
			.where(eq(formMeta.ulid, data.ulid))
			.returning()
	).at(0);

	if (!form) throw new Error("Unable to create form");
	insertFormFields(data);

	return form;
}

export function deleteForm(formUlid: string) {
	return db.delete(formMeta).where(eq(formMeta.ulid, formUlid));
}

export async function getFormByUlid(formUlid: string) {
	const results = await db.select().from(sutitForms).where(eq(sutitForms.form_meta.ulid, formUlid));
	return results.at(0);
}

export async function insertData(
	formUlid: string,
	data: { forms: { pages: Pages }; stores: Stores },
	price?: string | number
) {
	const formResponse = await db
		.insert(formResponses)
		.values({
			formUlid: formUlid,
			response: data.forms.pages,
			price: price ? +price : 0,
		} satisfies Drizzle.FormResponses.insert)
		.returning();

	const _stores = await db.select().from(stores).where(eq(stores.formUlid, formUlid));
	const storeUlid = _stores && _stores.length > 0 ? _stores.at(0)?.ulid : null;

	if (storeUlid) {
		db.insert(storeResponses).values({
			storeUlid: storeUlid,
			response: data.stores,
		} satisfies Drizzle.StoreResponses.insert);
	}

	return formResponse.at(0);
}

export async function getFormsByUser(userUlid: string) {
	return db
		.select()
		.from(sutitForms)
		.where(eq(sutitForms.form_meta.userUlid, userUlid))
		.orderBy(desc(sutitForms.form_meta.createdAt));
}

export async function insertFormPayment(details: { formUlid: string; paymentUlid: string }) {
	const processed = await isProcessedFormPayment(details);
	if (processed) return;
	await db
		.insert(formPayments)
		.values({
			formUlid: details.formUlid,
			paymentUlid: details.paymentUlid,
		} satisfies Drizzle.FormPayment.insert)
		.catch((e) => {
			console.error(e);
			throw e;
		});
}

export async function isProcessedFormPayment(details: { formUlid: string; paymentUlid: string }) {
	const payment = await db
		.select()
		.from(formPayments)
		.where(and(eq(formPayments.formUlid, details.formUlid), eq(formPayments.paymentUlid, details.paymentUlid)));
	if (payment.length) return payment.at(0);
	return false;
}

export async function insertPayment(amount: number, reference_code: string, phone_number: string) {
	const processed = await isProcessedPayment(reference_code);
	if (processed) {
		log.warn("Attempt to re-process payment", reference_code);
		return processed.ulid;
	}

	const _ulid = ulid();
	await db
		.insert(payments)
		.values({
			ulid: _ulid,
			amount: amount,
			referenceCode: reference_code,
			phoneNumber: phone_number.slice(-9),
		} satisfies Drizzle.Payment.insert)
		.catch((e) => {
			console.error(e);
			throw e;
		});
	return _ulid;
}

export async function isProcessedPayment(ref_code: string) {
	const payment = await db.select().from(payments).where(eq(payments.referenceCode, ref_code));
	if (payment.length) return payment.at(0);
	return false;
}

export async function getPayment(referenceCode: string) {
	return (await db.select().from(payments).where(eq(payments.referenceCode, referenceCode))).at(0);
}

export async function getFormPayments(formUulid: string) {
	return db.select().from(formPayments).where(eq(formPayments.formUlid, formUulid));
}

export async function getFormPaymentsSum(formUlid: string) {
	const form = await getFormByUlid(formUlid);
	if (!form) return 0;
	const result = await db
		.select({ total: sum(payments.amount) })
		.from(formPayments)
		.where(eq(formPayments.formUlid, formUlid))
		.innerJoin(payments, eq(formPayments.paymentUlid, payments.ulid));

	const total = result.reduce((acc, curr) => {
		const { total } = curr;
		if (!total) return acc;
		return acc + +total;
	}, 0);

	return total - (form.form_meta.withdrawnFunds || 0);
}

export async function getAllFormPayments(userUlid: string) {
	return db
		.select()
		.from(sutitForms)
		.where(eq(sutitForms.form_meta.userUlid, userUlid))
		.innerJoin(formPayments, eq(formPayments.formUlid, sutitForms.form_meta.ulid));
}

export async function getAllFormPaymentsSum(userUlid: string) {
	const _sum = await db
		.select({ total: sum(payments.amount) })
		.from(sutitForms)
		.where(eq(sutitForms.form_meta.userUlid, userUlid))
		.innerJoin(formPayments, eq(formPayments.formUlid, sutitForms.form_meta.ulid))
		.innerJoin(payments, eq(formPayments.paymentUlid, payments.ulid));

	return _sum.reduce((acc, curr) => {
		const { total } = curr;
		if (!total) return acc;
		return acc + +total;
	}, 0);
}

export async function getFormCount(userUlid: string) {
	const result = await db
		.select({ count: count(sutitForms.form_meta.ulid) })
		.from(sutitForms)
		.where(eq(sutitForms.form_meta.userUlid, userUlid));

	return result.reduce((acc, curr) => {
		const { count } = curr;
		if (!count) return acc;
		return acc + +count;
	}, 0);
}

export async function getResponsesCount(userUlid: string) {
	const result = await db
		.select({ count: count(sutitForms.form_meta.ulid) })
		.from(sutitForms)
		.where(eq(sutitForms.form_meta.userUlid, userUlid))
		.innerJoin(formResponses, eq(formResponses.formUlid, sutitForms.form_meta.ulid));
	return result.reduce((acc, curr) => {
		const { count } = curr;
		if (!count) return acc;
		return acc + +count;
	}, 0);
}

export async function neeedsPay(
	form: Drizzle.SutitForm | string,
	type: "group" | "individual",
	submitPrice?: number
): Promise<[Drizzle.SutitForm, boolean]> {
	if (typeof form === "string") {
		const data = await getFormByUlid(form).then((data) => {
			if (!data) {
				throw createError({
					statusCode: 404,
					message: "Form not found",
				});
			}
			return data;
		});
		form = data as object as Drizzle.SutitForm;
	}

	let price = 0;
	if (type === "individual") {
		price = form.form_meta.price_individual;
	} else {
		price = form.form_meta.price_group || 0;
	}

	if (price <= 0 && (!submitPrice || submitPrice <= 0)) return [form, false];
	return [form, true];
}

export function needsIndividualPayment(form: Drizzle.SutitForm | string, submitPrice?: number) {
	return neeedsPay(form, "individual", submitPrice);
}

export async function needsGroupPayment(form: Drizzle.SutitForm | string, submitPrice?: number) {
	return neeedsPay(form, "group", submitPrice);
}

export async function getRecentForms(userUlid: string) {
	return db.select().from(sutitForms).where(eq(sutitForms.form_meta.userUlid, userUlid)).limit(5).orderBy(desc(sutitForms.form_meta.updatedAt));
}

export async function updateFormWithdrawnFunds(formUlid: string, amount: number) {
	const form = await getFormByUlid(formUlid);
	await db
		.update(formMeta)
		.set({
			withdrawnFunds: Number(form?.form_meta.withdrawnFunds || 0) + amount,
		})
		.where(eq(formMeta.ulid, formUlid));
}

export function insertPrepaidLinkData(data: Drizzle.FormGroups.insert[]) {
	return db.insert(formGroups).values(data).execute();
}

export async function getPrepaidFormLink(formUlid: string, groupName: string, token: string) {
	const group = await getFirstOr404(
		formGroups,
		and(eq(formGroups.formUlid, formUlid), eq(formGroups.groupName, groupName))
	);
	return group.invites?.find(invite => invite.token === token)
}

export async function invalidateFormGroupLink(formUlid: string, groupName: string, token: string) {
	const group = await getFirstOr404(
		formGroups,
		and(eq(formGroups.formUlid, formUlid), eq(formGroups.groupName, groupName))
	);
	return db
		.update(formGroups)
		.set({
			invites: group.invites?.filter((invite) => invite.token !== token),
		})
		.where(eq(formGroups.ulid, group.ulid))
		.execute();
}

export async function createFormGroup(data: {
	formUlid: string;
	groupName: string;
	invites: FormGroupInvite;
	paymentUlid: string;
}) {
	return (
		await db
			.insert(formGroups)
			.values({
				groupName: data.groupName,
				formUlid: data.formUlid,
				paymentUlid: data.paymentUlid,
				invites: data.invites,
			})
			.returning()
	).at(0);
}
