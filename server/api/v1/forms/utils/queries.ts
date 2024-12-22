import {
	formPayments,
	payments,
	formFieldResponses,
	itemResponses,
	stores,
	formGroups,
	formMeta,
	formPages,
	storeItems,
	formFields,
	sutitForms,
	type FormGroupInvite,
	type PhoneInvite,
	type EmailInvite,
	formResponsesView,
} from "~~/server/db/schema";
import db from "../../../../db";
import { type Drizzle } from "~~/server/db/types";
import { and, eq, desc, sum, count } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";
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
				pageUlid: page_ulid,
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
			index: +key,
			ulid: store_ulid,
		});
		store?.forEach((item) => {
			itemsData.push({
				name: item.name,
				price: item.price,
				images: item.images,
				qtty: item.qtty,
				index: item.index,
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

export async function updateForm(data: z.infer<typeof formUpdateSchema>, user: Drizzle.User.select) {
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
	if (user.ulid !== form.userUlid) {
		throw createError({
			status: 403,
			message: "You are not allowed to make these changes to the form",
		});
	}

	insertFormFields(data);
	return form;
}

export function deleteForm(formUlid: string) {
	return db.delete(formMeta).where(eq(formMeta.ulid, formUlid));
}

export function reconstructDbForm(results: Drizzle.SutitForm): ReconstructedDbForm {
	const form_meta = results.at(0)?.form_meta;
	if (!form_meta) {
		throw createError({
			status: 500,
			message: "Unable to find the form's meta data",
		});
	}
	const { pages, stores } = results.reduce(
		(acc, curr) => {
			const pages = acc.pages.get(curr.form_element.page_index);
			const page_element = {
				...curr.form_element,
				accept: curr.form_element.accept || undefined,
				placeholder: curr.form_element.placeholder || undefined,
				description: curr.form_element.description || undefined,
			};
			if (pages) {
				pages.push(page_element);
			} else {
				acc.pages.set(curr.form_element.page_index, [page_element]);
			}

			const stores = acc.stores.get(curr.form_item.store_index);
			const form_item = {
				...curr.form_item,
				carted: false,
				liked: false,
				store: curr.form_item.store_index,
			};
			if (stores) {
				stores.push(form_item);
			} else {
				acc.stores.set(form_item.store, [form_item]);
			}
			return acc;
		},
		{ pages: new Map(), stores: new Map() } as {
			pages: Map<string, DbPage>;
			stores: Map<number, DbStore>;
		}
	);

	return {
		meta: form_meta,
		pages: Object.fromEntries(pages.entries()),
		stores: Object.fromEntries(stores.entries()),
	};
}

export async function getFormByUlid(formUlid: string) {
	const results = await db.select().from(sutitForms).where(eq(sutitForms.form_meta.ulid, formUlid));
	if (results.length) {
		return reconstructDbForm(results);
	} else {
		return null;
	}
}

export async function insertData(formUlid: string, data: ReconstructedDbForm, price_paid?: number) {
	const formResponseInsertList: Drizzle.FormResponses.insert[] = [];
	for (const key in data.pages) {
		const page = data.pages[key];
		for (const element of page || []) {
			formResponseInsertList.push({
				value: element.value,
				fieldUlid: element.fieldUlid,
			});
		}
	}
	const formResponse = await db.insert(formFieldResponses).values(formResponseInsertList).returning();
	await db
		.select()
		.from(stores)
		.where(eq(stores.formUlid, formUlid))
		.then((stores) => {
			if (!stores.length) return;

			const storeResponseInsertList: Drizzle.StoreResponses.insert[] = [];
			for (const key in data.stores) {
				const store = data.stores[key];
				for (const item of store || []) {
					storeResponseInsertList.push({
						value: item.name,
						liked: item.liked,
						carted: item.carted,
						itemUlid: item.itemUlid,
					});
				}
			}

			db.insert(itemResponses).values(storeResponseInsertList);
		});

	return formResponse.at(0)!;
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

	return total - (form.meta.withdrawnFunds || 0);
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
		.from(formResponsesView)
		.innerJoin(sutitForms, eq(formResponsesView.formUlid, sutitForms.form_meta.ulid))
		.where(eq(sutitForms.form_meta.userUlid, userUlid));
	return result.reduce((acc, curr) => {
		const { count } = curr;
		if (!count) return acc;
		return acc + +count;
	}, 0);
}

export async function neeedsPay(
	form: ReconstructedDbForm | string,
	type: "group" | "individual",
	submitPrice?: number
): Promise<[ReconstructedDbForm, boolean]> {
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
		form = data;
	}

	if (!form) {
		throw createError({
			statusCode: 404,
			message: "Form not found",
		});
	}

	let price = 0;
	if (type === "individual") {
		price = form.meta.price_individual;
	} else {
		price = form.meta.price_group || 0;
	}

	if (price <= 0 && (!submitPrice || submitPrice <= 0)) return [form, false];
	return [form, true];
}

export function needsIndividualPayment(form: ReconstructedDbForm | string, submitPrice?: number) {
	return neeedsPay(form, "individual", submitPrice);
}

export async function needsGroupPayment(form: ReconstructedDbForm | string, submitPrice?: number) {
	return neeedsPay(form, "group", submitPrice);
}

export async function getRecentForms(userUlid: string) {
	return db
		.select()
		.from(sutitForms)
		.where(eq(sutitForms.form_meta.userUlid, userUlid))
		.limit(5)
		.orderBy(desc(sutitForms.form_meta.updatedAt));
}

export async function updateFormWithdrawnFunds(formUlid: string, amount: number) {
	const form = await getFormByUlid(formUlid);
	await db
		.update(formMeta)
		.set({
			withdrawnFunds: Number(form?.meta.withdrawnFunds || 0) + amount,
		})
		.where(eq(formMeta.ulid, formUlid));
}

export async function getInviteFormGroup(formUlid: string, token: string) {
	// TODO: perf improve
	const groups = await db.select().from(formGroups).where(eq(formGroups.formUlid, formUlid));
	let invite: FormGroupInvite[number] | undefined;
	const group = groups.find((group) =>
		group.invites?.some((inv) => {
			if (inv.token === token) {
				invite = inv;
				return true;
			} else {
				return false;
			}
		})
	);
	return {
		invite,
		group,
	};
}

export async function invalidateFormGroupLink(formUlid: string, token: string) {
	const { group } = await getInviteFormGroup(formUlid, token);
	if (!group) return Promise.resolve(undefined);
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
	invites: Array<PhoneInvite | EmailInvite>;
	paymentUlid: string | null;
}) {
	return (
		await db
			.insert(formGroups)
			.values({
				groupName: data.groupName,
				formUlid: data.formUlid,
				paymentUlid: data.paymentUlid,
				invites: data.invites.map((invite) => ({
					token: ulid(),
					isValid: true,
					...invite,
				})),
			})
			.returning()
			.then((data) => {
				if (data.length === 0)
					throw createError({
						status: 404,
						message: "Unable to create from group",
					});
				return data;
			})
	).at(0)!;
}
