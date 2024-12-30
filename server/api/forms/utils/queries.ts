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
	formResponses,
	storeResponses,
	sutitStores,
} from "~~/server/db/schema";
import db from "../../../db";
import { type Drizzle } from "~~/server/db/types";
import { and, eq, desc, sum, count, sql, lt, notInArray } from "drizzle-orm";
import { ulid } from "ulid";
import { object, z } from "zod";
import { formBodyData } from "./zod";
import { updateConflictedColumns } from "~~/server/utils/db";
import type { Form, Page, Store } from "@chiballc/nuxt-form-builder";

async function insertFormFields(data: z.infer<typeof formBodyData> & { ulid: string }) {
	const fieldsData: Map<string, Drizzle.FormFields.insert> = new Map();
	const pagesData: Map<string, Drizzle.FormPages.insert> = new Map();
	for (const index in data.form.pages) {
		const page = data.form.pages[index] as DbPage & Page;
		const pageUlid = page.at(0)?.pageUlid || ulid();
		pagesData.set(pageUlid, {
			formUlid: data.ulid,
			index: index,
			ulid: pageUlid
		});
		page?.forEach((field) => {
			if (!field) return log.warn("Field was null in page", page);
			if (field.fieldUlid && fieldsData.has(field.fieldUlid)) return;
			const fieldUlid = field.fieldUlid || ulid();
			fieldsData.set(fieldUlid, {
				index: field.index!,
				inputType: field.inputType!,
				label: field.label || "Unlabelled",
				pageUlid: pageUlid,
				accept: field.accept,
				description: field.description,
				options: field.options,
				placeholder: field.placeholder,
				type: field.type,
				rules: field.rules,
				ulid: fieldUlid
			});
		});
	}

	if (pagesData.size) {
		await db
			.insert(formPages)
			.values(Array.from(pagesData.values()))
			.onConflictDoNothing()
	}
	if (fieldsData.size) {
		await db
			.insert(formFields)
			.values(Array.from(fieldsData.values()))
			.onConflictDoUpdate({
				target: formFields.ulid,
				set: updateConflictedColumns(formFields, [
					"accept",
					"description",
					"index",
					"inputType",
					"type",
					"label",
					"options",
					"placeholder",
					"rules"
				]),
			})
	}

	const storesData: Map<string, Drizzle.Store.insert> = new Map();
	const itemsData: Map<string, Drizzle.StoreItem.insert> = new Map();
	for (const key in data.form.stores) {
		const store = data.form.stores[key] as unknown as DbStore & Store;
		const storeUlid = store?.at(0)?.storeUlid || ulid();
		storesData.set(storeUlid, {
			formUlid: data.ulid,
			index: key,
			ulid: storeUlid
		});
		store?.forEach((item) => {
			if (item.itemUlid && itemsData.has(item.itemUlid)) return;
			const itemUlid = item.itemUlid || ulid();
			itemsData.set(itemUlid, {
				name: item.name,
				price: item.price,
				images: item.images,
				stock: item.stock,
				index: item.index,
				storeUlid: storeUlid,
				ulid: itemUlid
			});
		});
	}

	if (storesData.size) {
		await db
			.insert(stores)
			.values(Array.from(storesData.values()))
			.onConflictDoNothing()
	}
	if (itemsData.size) {
		await db
			.insert(storeItems)
			.values(Array.from(itemsData.values()))
			.onConflictDoUpdate({
				target: storeItems.ulid,
				set: updateConflictedColumns(storeItems, [
					"images",
					"index",
					"name",
					"price",
					"stock",
					"isInfinite"
				]),
			})
	}

	// db.delete(storeItems).where(and(eq(), lt(storeItems.updatedAt, updateTimeStamp)));
	// db.delete(stores).where(lt(stores.updatedAt, updateTimeStamp));
	// db.delete(formFields).where(lt(formFields.updatedAt, updateTimeStamp));
	// db.delete(formPages).where(lt(formPages.updatedAt, updateTimeStamp));
}

export async function createForm(data: z.infer<typeof formBodyData>, { user }: AuthData) {
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

export async function updateForm(formUlid: string, data: z.infer<typeof formBodyData>, user: Drizzle.User.select) {
	db.update(formMeta)
		.set({
			allowGroups: data.allowGroups,
			group_invite_message: data.payment.group_message,
			group_member_count: data.payment.group_limit,
			price_group: data.payment.group_amount || undefined,
			price_individual: data.payment.amount || undefined,
			formName: data.name,
			formDescription: data.description,
			userUlid: user.ulid,
		})
		.where(eq(formMeta.ulid, formUlid))
		.execute();
	const form = await getFormByUlid(formUlid);
	if (!form) throw new Error("Unable to find the initial form to edit");

	if (user.ulid !== form.meta.userUlid) {
		throw createError({
			status: 403,
			message: "You are not allowed to make these changes to the form",
		});
	}

	insertFormFields({ ...data, ulid: formUlid });
	return form.meta;
}

export async function deleteForm(formUlid: string) {
	return (await db.delete(formMeta).where(eq(formMeta.ulid, formUlid)).returning()).at(0);
}

export async function reconstructDbForm(results: Array<typeof sutitForms.$inferSelect>): Promise<ReconstructedDbForm> {
	const form_meta = results.at(0)?.form_meta;
	if (!form_meta) {
		throw createError({
			status: 500,
			message: "Unable to find the form's meta data",
		});
	}
	const { pages } = results.reduce(
		(acc, curr) => {
			if (curr.form_elements.page_index !== null) {
				const pages = acc.pages.get(curr.form_elements.page_index);
				const page_element = curr.form_elements;
				if (pages) {
					pages.push(page_element);
				} else {
					acc.pages.set(curr.form_elements.page_index, [page_element]);
				}
			}
			return acc;
		},
		{ pages: new Map() } as {
			pages: Map<string, DbPage>;
		}
	);

	const stores = await db.select().from(sutitStores).where(eq(sutitStores.formUlid, form_meta.ulid));

	return {
		meta: form_meta,
		pages: Object.fromEntries(pages.entries()),
		stores: stores.reduce((acc, curr) => {
			const store = acc[curr.store_index];
			const item = {
				...curr,
				qtty: 1,
				store: curr.store_index,
				carted: false,
				liked: false,
			};
			if (store) {
				store.push(item);
			} else {
				acc[curr.store_index] = [item];
			}
			return acc;
		}, {} as ReconstructedDbForm["stores"]),
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

export async function insertData(formUlid: string, data: ReconstructedDbForm & Form, price_paid?: number) {
	const formResponse = (
		await db
			.insert(formResponses)
			.values({
				pricePaid: price_paid,
			})
			.returning()
	).at(0);
	if (!formResponse) {
		throw createError({
			statusCode: 500,
			message: "Unable to create a form response",
		});
	}

	function getValue(value: any) {
		if (typeof value !== "object") return value;
		if (Array.isArray(value)) {
			return JSON.stringify(value);
		}
		return Object.keys(value)
			.reduce((acc, key) => {
				const curr = JSON.stringify(value[key]);
				acc.push(curr);
				return acc;
			}, [] as string[])
			.join(", ");
	}
	const formfieldResponseInsertList: Drizzle.FormFieldResponse.insert[] = [];
	for (const key in data.pages) {
		const page = data.pages[key];
		for (const element of page || []) {
			formfieldResponseInsertList.push({
				value: getValue(element.value),
				fieldUlid: element.fieldUlid!,
				formResponseUlid: formResponse.ulid,
			});
		}
	}
	db.insert(formFieldResponses).values(formfieldResponseInsertList).execute();
	db.select()
		.from(stores)
		.where(eq(stores.formUlid, formUlid))
		.then(async (stores) => {
			if (!stores.length) return;

			const storeResponseInsertList: Omit<Drizzle.StoreItemResponse.insert, "storeResponseUlid">[] = [];
			for (const key in data.stores) {
				const store = data.stores[key];
				for (const item of store || []) {
					if (!(item.carted || item.liked)) continue;
					storeResponseInsertList.push({
						value: item.name,
						liked: item.liked,
						carted: item.carted,
						itemUlid: item.itemUlid,
						qtty: item.qtty,
					});
				}
			}

			if (storeResponseInsertList.length) {
				const storeResponse = (
					await db
						.insert(storeResponses)
						.values({
							pricePaid: price_paid,
						})
						.returning()
				).at(0);
				if (!storeResponse) {
					throw createError({
						message: "Unable to create a store response",
					});
				}
				db.insert(itemResponses)
					.values(storeResponseInsertList.map((item) => ({ ...item, storeResponseUlid: storeResponse.ulid })))
					.execute()
					.finally(() => {
						storeResponseInsertList.forEach((item) => {
							if (!item.qtty) return;
							adjustItemQuantity(item.itemUlid, item.qtty);
						});
					});
			}
		});
	return formResponse;
}

export async function getFormsByUser(userUlid: string) {
	return db.select().from(formMeta).where(eq(formMeta.userUlid, userUlid)).orderBy(desc(formMeta.createdAt));
}

function adjustItemQuantity(itemUlid: string, qtty: number) {
	qtty = Math.abs(qtty || 0);
	if (!qtty || !itemUlid) return;
	return db
		.update(storeItems)
		.set({
			stock: sql`${storeItems.stock} - ${+qtty}`,
		})
		.where(eq(storeItems.ulid, itemUlid))
		.execute()
		.catch(log.error);
}

export async function insertFormPayment(details: { formUlid: string; paymentUlid: string }) {
	const processed = await isProcessedFormPayment(details);
	if (processed) return;
	return db
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
		return processed;
	}
	const results = await db
		.insert(payments)
		.values({
			amount: amount,
			referenceCode: reference_code,
			phoneNumber: phone_number.slice(-9),
		} satisfies Drizzle.Payment.insert)
		.returning();
	return results.at(0);
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
		.from(formMeta)
		.where(eq(formMeta.userUlid, userUlid))
		.innerJoin(formPayments, eq(formPayments.formUlid, formMeta.ulid))
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
		.from(formMeta)
		.where(eq(formMeta.userUlid, userUlid));

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
		form = (await getFormByUlid(form))!;
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
	return db.select().from(formMeta).where(eq(formMeta.userUlid, userUlid)).limit(5).orderBy(desc(formMeta.createdAt));
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
