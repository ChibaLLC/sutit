import { eq, and, InferInsertModel, count } from "drizzle-orm";
import {
	activities,
	fieldResponses,
	formFields,
	formPages,
	forms,
	formStatusEnum,
	formStores,
	formSubmissions,
	payments,
	storeItems,
	storeResponses,
	submissionStatusEnum,
} from "../db/schema";
import db from "../db";
import { FormSchema } from "~~/shared/types";

export type NewForm = InferInsertModel<typeof forms>;
export type NewFormSection = InferInsertModel<typeof formPages>;
export type NewFormField = InferInsertModel<typeof formFields>;

export const getUserForms = async (createdBy: string) => {
	return db.query.forms.findMany({
		where: eq(forms.createdBy, createdBy),
		with: {
			creator: true,
		},
	});
};

export const createForm = async (payload: FormSchema) => {
	const { stores, pages, ...formPayload } = payload;
	return db.transaction(async (tx) => {
		// 1. Create the Form
		const [newForm] = await tx
			.insert(forms)
			.values({
				...formPayload,
				createdBy: payload.createdBy,
				status: formPayload.status || "draft",
				publishedAt: formPayload.publishedAt
					? new Date(formPayload.publishedAt)
					: undefined,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newForm) {
			tx.rollback();
			console.log("Failed to create form.");
			throw new Error("Failed to create form.");
		}

		// 2. Create Sections and Fields
		for (const page of pages) {
			const [newPage] = await tx
				.insert(formPages)
				.values({
					formId: newForm.id,
					title: page.title,
					description: page.description,
					orderIndex: page.orderIndex,
					createdAt: new Date(),
				})
				.returning();

			if (!newPage) {
				tx.rollback();
				throw new Error("Failed to create form section.");
			}

			for (const fieldPayload of page.fields) {
				const { id, ...fieldData } = fieldPayload;
				await tx.insert(formFields).values({
					...fieldData,
					pageId: newPage.id,
					createdAt: new Date(),
					type: fieldPayload.type,
					name:
						fieldPayload.label.split(" ").join("_").toLocaleLowerCase() +
						"_" +
						fieldPayload.name,
				});
			}
		}

		if (stores && stores.length > 0) {
			stores?.forEach(async (store) => {
				const [newStore] = await tx
					.insert(formStores)
					.values({
						formId: newForm.id,
						name: store.name,
						description: store.description,
					})
					.returning();
				store.items.forEach(async (it) => {
					await tx.insert(storeItems).values({
						isInfinite: it.infinite,
						storeId: newStore.id,
						price: it.price,
						quantity: it.quantity,
						images: it.images,
						name: it.name,
						description: it.description,
					});
				});
			});
		}

		// 3. Log Activity
		await tx.insert(activities).values({
			userId: newForm.createdBy,
			formId: newForm.id,
			type: "form_created",
			description: `Form '${newForm.title}' created.`,
			resourceType: "form",
			resourceId: newForm.id,
			createdAt: new Date(),
			metadata: { title: newForm.title, slug: newForm.slug },
		});

		return newForm;
	});
};

export async function getFormById(formId: string) {
	try {
		const form = await db.query.forms.findFirst({
			where: eq(forms.id, formId),
			with: {
				pages: {
					with: {
						fields: {
							orderBy: (fields, { asc }) => [asc(fields.orderIndex)],
						},
					},
					orderBy: (pages, { asc }) => [asc(pages.orderIndex)],
				},
				creator: {
					columns: { id: true, email: true, name: true },
				},
				stores: {
					with: {
						items: true,
					},
				},
			},
		});

		return form;
	} catch (error) {
		console.error("Error fetching form by ID:", error);
		throw new Error("Failed to retrieve form.");
	}
}
export async function getFormSubmissionDetails(submissionId: string) {
	try {
		const submission = await db.query.formSubmissions.findFirst({
			where: eq(formSubmissions.id, submissionId),
			with: {
				form: {
					columns: { id: true, title: true, slug: true },
				},
				submitter: {
					columns: { id: true, email: true, name: true },
				},
				responses: {
					with: {
						field: {
							columns: { id: true, name: true, label: true, fieldType: true },
						},
					},
				},
				storeResponses: {
					with: {
						items: {
							with: {
								storeItem: {
									columns: {
										id: true,
										name: true,
										description: true,
										price: true,
									},
								},
							},
						},
						payment: true,
					},
				},
			},
		});
		return submission;
	} catch (error) {
		console.error("Error fetching submission details:", error);
		throw new Error("Failed to retrieve submission details.");
	}
}
export type UpdateFormPayload = Partial<
	Omit<NewForm, "id" | "createdBy" | "createdAt">
>;

export async function updateForm(
	formId: string,
	payload: UpdateFormPayload,
	updaterId: string,
) {
	return db.transaction(async (tx) => {
		const [existingForm] = await tx
			.select()
			.from(forms)
			.where(eq(forms.id, formId));
		if (!existingForm) {
			tx.rollback();
			throw new Error("Form not found.");
		}

		const [updatedForm] = await tx
			.update(forms)
			.set({
				...payload,
				updatedAt: new Date(),
				// If status changes to 'published', set publishedAt
				publishedAt:
					payload.status === "published" && !existingForm.publishedAt
						? new Date()
						: existingForm.publishedAt,
			})
			.where(eq(forms.id, formId))
			.returning();

		if (!updatedForm) {
			tx.rollback();
			throw new Error("Failed to update form.");
		}

		await tx.insert(activities).values({
			id: uuidv4(),
			userId: updaterId,
			formId: updatedForm.id,
			type: "form_updated",
			description: `Form '${updatedForm.title}' updated.`,
			resourceType: "form",
			resourceId: updatedForm.id,
			createdAt: new Date(),
			metadata: {
				title: updatedForm.title,
				slug: updatedForm.slug,
				changes: payload,
			},
		});

		return updatedForm;
	});
}

export async function deleteForm(formId: string, deleterId: string) {
	return db.transaction(async (tx) => {
		const [existingForm] = await tx
			.select()
			.from(forms)
			.where(eq(forms.id, formId));
		if (!existingForm) {
			tx.rollback();
			throw new Error("Form not found.");
		}

		const result = await tx.delete(forms).where(eq(forms.id, formId));
		if (result.rowCount === 0) {
			// Check if any row was actually deleted (drizzle's returning() would be better but not always available on delete)
			tx.rollback();
			throw new Error("Failed to delete form.");
		}

		await tx.insert(activities).values({
			userId: deleterId,
			formId: formId, // Use formId here as the form itself is gone
			type: "form_deleted",
			description: `Form '${existingForm.title}' deleted.`,
			resourceType: "form",
			resourceId: formId,
			createdAt: new Date(),
			metadata: { title: existingForm.title },
		});
		return {
			success: true,
			message: `Form ${formId} and its related data deleted.`,
		};
	});
}
