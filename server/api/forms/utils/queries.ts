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
	sutitForms,
	type FormGroupInvite,
	type PhoneInvite,
	type EmailInvite,
	formResponsesView,
	formResponses,
	storeResponses,
	sutitStores,
	sutitFormPages,
	formGroupResponses,
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
import { hasInfiniteStock, parseStock } from ".";

async function insertFormFields(data: z.infer<typeof formBodyData> & { ulid: string }, update: boolean = false) {
	const pagesData: Map<string, Drizzle.FormPages.insert> = new Map();
	const fieldsData: Map<string, any> = new Map(); // Track all fields for deletion
	const updateTimeStamp = new Date();

	for (const index in data.form.pages) {
		const page = data.form.pages[index] as DbPage & Page;
		// Use existing pageUlid if available, otherwise generate a new one
		const pageUlid = page[0]?.pageUlid || ulid();

		const fields = page.map((field) => {
			// Use existing field ULID if available
			const fieldUlid = field.ulid || field.fieldUlid || ulid();

			// Store field ULID to track for deletion later
			fieldsData.set(fieldUlid, true);

			return {
				index: field.index,
				inputType: field.inputType,
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
			};
		});

		pagesData.set(pageUlid, {
			formUlid: data.ulid,
			index: parseInt(index),
			ulid: pageUlid,
			fields: fields,
			updatedAt: updateTimeStamp,
		});
	}

	if (pagesData.size) {
		await db
			.insert(formPages)
			.values(Array.from(pagesData.values()))
			.onConflictDoUpdate({
				target: formPages.ulid,
				set: {
					fields: sql`excluded.fields`, // Take new fields
					index: sql`excluded.index`,
					updatedAt: updateTimeStamp,
				},
			});
	}

	// Store processing (unchanged)
	const storesData: Map<string, Drizzle.Store.insert> = new Map();
	const itemsData: Map<string, Drizzle.StoreItem.insert> = new Map();

	for (const key in data.form.stores) {
		const store = data.form.stores[key] as unknown as DbStore & Store;
		const storeUlid = store?.[0]?.storeUlid || ulid();

		storesData.set(storeUlid, {
			formUlid: data.ulid,
			index: parseInt(key),
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
				isInfinite: hasInfiniteStock(item),
			});
		});
	}

	if (storesData.size) {
		await db
			.insert(stores)
			.values(Array.from(storesData.values()))
			.onConflictDoUpdate({
				target: stores.ulid,
				set: updateConflictedColumns(stores, ["updatedAt", "index"]),
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

	// Clean up outdated items
	await db
		.delete(storeItems)
		.where(
			and(
				lt(storeItems.updatedAt, updateTimeStamp),
				notInArray(storeItems.ulid, Array.from(itemsData.keys())),
				inArray(storeItems.storeUlid, Array.from(storesData.keys())),
			),
		);

	// Clean up outdated stores
	await db
		.delete(stores)
		.where(
			and(
				lt(stores.updatedAt, updateTimeStamp),
				eq(stores.formUlid, data.ulid),
				notInArray(stores.ulid, Array.from(storesData.keys())),
			),
		);

	// Clean up outdated pages
	await db
		.delete(formPages)
		.where(
			and(
				lt(formPages.updatedAt, updateTimeStamp),
				eq(formPages.formUlid, data.ulid),
				notInArray(formPages.ulid, Array.from(pagesData.keys())),
			),
		);
}

export async function createForm(data: z.infer<typeof formBodyData>, { user }: AuthData) {
	const form = (
		await db
			.insert(formMeta)
			.values({
				allowGroups: data.allowGroups,
				group_invite_message: data.payment.group_invite_message,
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
	await insertFormFields({ ...data, ulid: form.ulid });

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

	// Update form metadata
	await db
		.update(formMeta)
		.set({
			allowGroups: data.allowGroups,
			group_invite_message: data.payment.group_invite_message,
			group_member_count: data.payment.group_limit,
			price_group: data.payment.group_amount || 0,
			price_individual: data.payment.amount || 0,
			formName: data.name,
			formDescription: data.description,
			userUlid: user.ulid,
			requireMerch: data.requireMerch,
			updatedAt: new Date(),
		})
		.where(eq(formMeta.ulid, formUlid))
		.execute();

	// Update form fields
	await insertFormFields({ ...data, ulid: formUlid }, true);
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
			}),
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

export async function reconstructDbForm(results: any): Promise<ReconstructedDbForm> {
	const form_meta = results[0];
	const pages = await db.select().from(sutitFormPages).where(eq(sutitFormPages.formUlid, form_meta.ulid));
	// Formart Pages into an Object
	const formartPages = {};
	// Loop Through Pages
	pages.forEach((page, index) => {
		formartPages[index] = page.fields;
	});

	const stores = await db.select().from(sutitStores).where(eq(sutitStores.formUlid, form_meta.ulid));
	const user = await getUserByUlId(form_meta.userUlid);
	if (user && user.email) {
		await offloadStoreImages(stores, form_meta);
	} else {
		console.warn("User email not found during image optimisation");
	}

	return {
		meta: form_meta,
		pages: formartPages,
		stores: stores.reduce(
			(acc, curr) => {
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
			},
			{} as ReconstructedDbForm["stores"],
		),
	};
}

export async function getFormByUlid(formUlid: string) {
	const results = await db.select().from(sutitForms).where(eq(sutitForms.ulid, formUlid));
	if (results) {
		return reconstructDbForm(results);
	} else {
		return null;
	}
}

export async function insertData(
	formUlid: string,
	data: { meta: ReconstructedDbForm["meta"]; pages: Record<string, any>; stores: Record<string, any> },
	price_paid?: number,
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
	data.pages.forEach((field, key) => {
		formfieldResponseInsertList.push({
			value:
				typeof field.value == "string"
					? field.value
					: typeof field.value == "object" && field.value != null
						? Object.values(field.value)[0]
						: "",
			field: field,
			fieldUlid: field.ulid,
			formResponseUlid: formResponse.ulid,
			formUlid: data.meta.ulid,
		});
	});
	// for (const key in data.pages) {
	// 	const response = data.pages[key];
	// 	formfieldResponseInsertList.push({
	// 		value: getValue(response),
	// 		fieldUlid: key,
	// 		formResponseUlid: formResponse.ulid,
	// 	});
	// }
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
							formResponseUlid: formResponse.ulid,
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

export async function insertGroupResponse(formUlid: string, responseUlid: string, formGroupUlid: string) {
	const groupResponse = await db.insert(formGroupResponses).values({
		formUlid: formUlid,
		responseUlid: responseUlid,
		formGroupUlid: formGroupUlid,
	});
	return groupResponse;
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
		.where(eq(sutitForms.userUlid, userUlid))
		.innerJoin(formPayments, eq(formPayments.formUlid, sutitForms.ulid));
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
		.select({ count: count(sutitForms.ulid) })
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
		.select({ count: count(sutitForms.ulid) })
		.from(formResponsesView)
		.innerJoin(sutitForms, eq(formResponsesView.formUlid, sutitForms.ulid))
		.where(eq(sutitForms.userUlid, userUlid));
	return result.reduce((acc, curr) => {
		const { count } = curr;
		if (!count) return acc;
		return acc + +count;
	}, 0);
}

export async function neeedsPay(
	form: ReconstructedDbForm | string,
	type: "group" | "individual",
	submitPrice?: number,
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
		}),
	);
	return {
		invite,
		group,
	};
}

export async function invalidateFormGroupLink(formUlid: string, token: string) {
	const { group } = await getInviteFormGroup(formUlid, token);
	if (!group) return Promise.resolve(undefined);

	// Update the invites array by setting isValid to false for the matching token
	return await db
		.update(formGroups)
		.set({
			invites: group.invites?.map((invite) => (invite.token == token ? { ...invite, isValid: false } : invite)),
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
