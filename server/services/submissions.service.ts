import { SubmissionData } from "~~/shared/types";
import db from "../db";
import {
	fieldResponses,
	forms,
	formSubmissions,
	storeItems,
	storeResponses,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { getFormById } from "./form.service";

export const submitForm = async (
	formId: string,
	data: SubmissionData,
	submitterId?: string,
) => {
	return db.transaction(async (tx) => {
		// 1. Get form (to read base price)
		const form = await getFormById(formId);

		if (!form) {
			throw new Error(`Form not found: ${formId}`);
		}

		// 2. Create submission
		const [submission] = await tx
			.insert(formSubmissions)
			.values({
				formId: form.id,
				submitterId,
				status: parseInt(form.price || "0") > 0 ? "pending" : "completed",
				metadata: {
					paymentData: data.paymentData ?? null,
				},
				pricePaid: 0, // will be updated after we compute total
			})
			.returning();

		if (!submission) {
			tx.rollback();
			throw new Error("Failed to create submission");
		}

		// 3. Insert field responses
		for (const [fieldId, value] of Object.entries(data.formData)) {
			await tx.insert(fieldResponses).values({
				submissionId: submission.id,
				fieldId,
				value: typeof value === "string" ? value : String(value),
				parsedValue: typeof value === "object" ? value : null,
			});
		}

		// 4. Insert store responses
		let storeTotal = 0;

		for (const [itemId, { quantity }] of Object.entries(
			data.selectedProducts,
		)) {
			const [storeItem] = await tx
				.select()
				.from(storeItems)
				.where(eq(storeItems.id, itemId))
				.limit(1);

			if (!storeItem) {
				tx.rollback();
				throw new Error(`Invalid store item: ${itemId}`);
			}
			if (!storeItem.isInfinite) {
				if (!storeItem.quantity || storeItem.quantity < quantity) {
					throw new Error("No enough stock");
				}
			}

			const total = parseInt(storeItem.price) * quantity;
			storeTotal += total;

			await tx.insert(storeResponses).values({
				submissionId: submission.id,
				storeItemId: storeItem.id,
				quantity: quantity,
				price: parseInt(storeItem.price),
				total,
			});
			await tx.update(storeItems).set({
				quantity: storeItem.quantity ? storeItem.quantity - quantity : 0,
			});
		}

		// 5. Compute final total = base form price + store items total
		const totalPaid = (parseInt(form.price || "0") ?? 0) + storeTotal;

		await tx
			.update(formSubmissions)
			.set({ pricePaid: totalPaid })
			.where(eq(formSubmissions.id, submission.id));

		return {
			submmission: {
				...submission,
				pricePaid: totalPaid,
			},
			form: form,
		};
	});
};

export const getFormSubmissions = async (formId: string) => {
	let submissions = await db.query.formSubmissions.findMany({
		where: eq(formSubmissions.formId, formId),
		with: {
			form: true,
			responses: {
				with: {
					field: true,
				},
			},
			storeResponses: {
				with: {
					item: true,
				},
			},
			submitter: true,
		},
	});
	return submissions;
};
