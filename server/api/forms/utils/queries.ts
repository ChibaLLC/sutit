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
import { and, eq, desc, sum, count, sql, lt, notInArray, inArray } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";
import { formBodyData } from "./zod";
import { updateConflictedColumns } from "~~/server/utils/db";
import type { Item, Page, Store } from "@chiballc/nuxt-form-builder";
import { getUserByUlId } from "../../users/utils/queries";
import { sep } from "node:path";

async function insertFormFields(data: z.infer<typeof formBodyData> & { ulid: string }) {
	const fieldsData: Map<string, Drizzle.FormFields.insert> = new Map();
	const pagesData: Map<string, Drizzle.FormPages.insert> = new Map();
	const updateTimeStamp = new Date();
	for (const index in data.form.pages) {
		const page = data.form.pages[index] as DbPage & Page;
		const pageUlid = page.at(0)?.pageUlid || ulid();
		pagesData.set(pageUlid, {
			formUlid: data.ulid,
			index: index,
			ulid: pageUlid,
			updatedAt: updateTimeStamp,
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
				ulid: fieldUlid,
				updatedAt: updateTimeStamp,
			});
		});
	}

	if (pagesData.size) {
		await db
			.insert(formPages)
			.values(Array.from(pagesData.values()))
			.onConflictDoUpdate({
				target: formPages.ulid,
				set: updateConflictedColumns(formPages, ["updatedAt"]),
			});
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
					"rules",
					"updatedAt",
				]),
			});
	}

	const storesData: Map<string, Drizzle.Store.insert> = new Map();
	const itemsData: Map<string, Drizzle.StoreItem.insert> = new Map();

	function isInfinite(item: Item | DbStore[number]) {
		return `${item.stock}`.includes("infinit") || (item as DbStore[number]).isInfinite === true;
	}

	function parseStock(item: Item | DbStore[number]) {
		if (isInfinite(item)) {
			(item as DbStore[number]).isInfinite = true;
			item.stock = 0;
		} else {
			try {
				if (typeof item.stock !== "number") {
					item.stock = parseInt(item.stock);
				}
			} catch (_) {}

			if (isNaN(item.stock as any)) {
				item.stock = 0;
				(item as DbStore[number]).isInfinite = true;
			} else {
				(item as DbStore[number]).isInfinite = false;
			}
		}

		return item.stock as number;
	}
	for (const key in data.form.stores) {
		const store = data.form.stores[key] as unknown as DbStore & Store;
		const storeUlid = store?.at(0)?.storeUlid || ulid();
		storesData.set(storeUlid, {
			formUlid: data.ulid,
			index: key,
			ulid: storeUlid,
			updatedAt: updateTimeStamp,
		});
		store?.forEach((item) => {
			if (item.itemUlid && itemsData.has(item.itemUlid)) return;
			const itemUlid = item.itemUlid || ulid();
			itemsData.set(itemUlid, {
				name: item.name,
				price: item.price,
				images: item.images,
				stock: parseStock(item),
				index: item.index,
				storeUlid: storeUlid,
				ulid: itemUlid,
				updatedAt: updateTimeStamp,
				isInfinite: isInfinite(item),
			});
		});
	}

	if (storesData.size) {
		await db
			.insert(stores)
			.values(Array.from(storesData.values()))
			.onConflictDoUpdate({
				target: stores.ulid,
				set: updateConflictedColumns(stores, ["updatedAt"]),
			});
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
					"isInfinite",
					"updatedAt",
				]),
			});
	}

	await db
		.delete(storeItems)
		.where(
			and(
				lt(storeItems.updatedAt, updateTimeStamp),
				notInArray(storeItems.ulid, Array.from(itemsData.keys())),
				inArray(storeItems.storeUlid, Array.from(storesData.keys()))
			)
		);
	await db
		.delete(stores)
		.where(
			and(
				lt(stores.updatedAt, updateTimeStamp),
				eq(stores.formUlid, data.ulid),
				notInArray(stores.ulid, Array.from(storesData.keys()))
			)
		);

	await db
		.delete(formFields)
		.where(
			and(
				lt(formFields.updatedAt, updateTimeStamp),
				inArray(formFields.pageUlid, Array.from(pagesData.keys())),
				notInArray(formFields.ulid, Array.from(fieldsData.keys()))
			)
		);
	await db
		.delete(formPages)
		.where(
			and(
				lt(formPages.updatedAt, updateTimeStamp),
				eq(formPages.formUlid, data.ulid),
				notInArray(formPages.ulid, Array.from(pagesData.keys()))
			)
		);
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
	const form = await getFormByUlid(formUlid);
	if (!form) throw new Error("Unable to find the initial form to edit");
	if (form.meta.userUlid !== user.ulid) {
		throw createError({
			statusCode: 403,
			message: "You are not allowed to edit this form.",
		});
	}

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
			requireMerch: data.requireMerch,
			updatedAt: new Date(),
		})
		.where(eq(formMeta.ulid, formUlid))
		.execute();

	insertFormFields({ ...data, ulid: formUlid });
	return form.meta;
}

export async function deleteForm(formUlid: string) {
	return (await db.delete(formMeta).where(eq(formMeta.ulid, formUlid)).returning()).at(0);
}

// TODO: @blocked remove email dependancy
async function offloadStoreImages(items: Drizzle.SutitStore[], form_meta: Drizzle.SutitForm["form_meta"]) {
	const editedItems: Drizzle.SutitStore[] = [];
	const promises = items.map(async (item) => {
		await Promise.all(
			item.images?.map(async (image, index) => {
				if (isBase64DataEncodedString(image)) {
					try {
						const { blob, extension } = await base64ToBlob(image);
						if (!blob) return;

						let filename = `${item.name}-image-${index}`;
						const folder = `${form_meta.userUlid}${sep}${form_meta.ulid}`;
						const destination = `${folder}${sep}${filename}.${extension}`;

						await $storage.file.setItemRaw(destination, blob);
						const path = `/files/${destination}`;
						item.images[index] = path;
						editedItems.push(item);
					} catch (e) {
						log.error(e);
					}
				}
			})
		);
		return item;
	});

	await Promise.all(promises.flat());
	// TODO: @blocked Uncomment once store images fix
	// if (editedItems.length) {
	// 	db.insert(storeItems)
	// 		.values(
	// 			editedItems.map((item) => ({
	// 				images: item.images,
	// 				index: item.index,
	// 				name: item.name,
	// 				price: item.price,
	// 				ulid: item.itemUlid,
	// 				isInfinite: item.isInfinite,
	// 				likes: item.likes,
	// 				storeUlid: item.storeUlid,
	// 				stock: item.stock,
	// 			}))
	// 		)
	// 		.onConflictDoUpdate({
	// 			target: storeItems.ulid,
	// 			set: updateConflictedColumns(storeItems, ["images"]),
	// 		})
	// 		.execute();
	// }
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
				const pages = acc.pages[curr.form_elements.page_index];
				const form_element = curr.form_elements;
				if (pages) {
					pages.push(form_element);
				} else {
					acc.pages[curr.form_elements.page_index] = [form_element];
				}
			}
			return acc;
		},
		{ pages: {} } as {
			pages: Record<string, DbPage>;
		}
	);

	const stores = await db.select().from(sutitStores).where(eq(sutitStores.formUlid, form_meta.ulid));
	const user = await getUserByUlId(form_meta.userUlid);
	if (user && user.email) {
		await offloadStoreImages(stores, form_meta);
	} else {
		console.warn("User email not found during image optimisation");
	}

	return {
		meta: form_meta,
		pages: pages,
		stores: stores.reduce((acc, curr) => {
			const store = acc[curr.store_index];
			const item = {
				...curr,
				qtty: 1,
				store: curr.store_index,
				carted: false,
				liked: false,
				stock: curr.isInfinite ? ("infinity" as "infinity") : curr.stock,
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

export async function insertData(
	formUlid: string,
	data: { meta: ReconstructedDbForm["meta"]; pages: Record<string, any>; stores: Record<string, any> },
	price_paid?: number
) {
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
		if (!value) return undefined;
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
		const response = data.pages[key];
		formfieldResponseInsertList.push({
			value: getValue(response),
			fieldUlid: key,
			formResponseUlid: formResponse.ulid,
		});
	}
	if (formfieldResponseInsertList.length) {
		db.insert(formFieldResponses).values(formfieldResponseInsertList).execute();
	}
	db.select()
		.from(stores)
		.where(eq(stores.formUlid, formUlid))
		.then(async (stores) => {
			if (!stores.length) return;

			const storeResponseInsertList: Omit<Drizzle.StoreItemResponse.insert, "storeResponseUlid">[] = [];
			for (const key in data.stores) {
				const item = data.stores[key];
				storeResponseInsertList.push({
					value: item.name,
					liked: item.liked,
					carted: item.carted,
					itemUlid: key,
					qtty: item.qtty,
				});
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
	return db.select().from(formMeta).where(eq(formMeta.userUlid, userUlid)).orderBy(desc(formMeta.updatedAt));
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
	return db.select().from(formMeta).where(eq(formMeta.userUlid, userUlid)).limit(5).orderBy(desc(formMeta.updatedAt));
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
