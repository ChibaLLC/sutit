import {
  and,
  between,
  eq,
  ilike,
  inArray,
  InferInsertModel,
  ne,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import {
  activities,
  formAnalytics,
  formFields,
  formGroupMemberPayments,
  formGroupMembers,
  formPages,
  forms,
  formStores,
  storeItems,
} from "../db/schema";
import db from "../db";
import { FormSchema } from "~~/shared/types";
import { slugify } from "~~/shared/utils/form.schema";
interface Filters {
  limit?: number;
  offset?: number;
  search?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export type NewForm = InferInsertModel<typeof forms>;
export type NewFormSection = InferInsertModel<typeof formPages>;
export type NewFormField = InferInsertModel<typeof formFields>;
const buildFormFilters = (createdBy: string, options?: Filters) => {
  return [
    eq(forms.createdBy, createdBy),
    options?.search && ilike(forms.title, `%${options.search}%`),
    options?.from &&
      options?.to &&
      between(forms.createdAt, new Date(options.from), new Date(options.to)),
  ].filter(Boolean);
};
export const getUserForms = async (createdBy: string, options?: Filters) => {
  return db.query.forms.findMany({
    where: and(...buildFormFilters(createdBy, options)),
    with: {
      creator: true,
    },
    orderBy: (form, { desc }) => [desc(form.createdAt)],
  });
};

export const createForm = async (payload: FormSchema) => {
  const { stores, pages, ...formPayload } = payload;
  return db.transaction(async (tx) => {
    try {
      const existingForm = await tx.query.forms.findFirst({
        where: eq(forms.slug, formPayload.slug),
        columns: { id: true, slug: true },
      });

      if (existingForm) {
        throw new Error(
          `A form with the slug "${formPayload.slug}" already exists. Please choose a different slug.`,
        );
      }
      // 1. Create the Form
      const [newForm] = await tx
        .insert(forms)
        .values({
          ...formPayload,
          slug: slugify(formPayload.slug),
          createdBy: payload.createdBy,
          status: formPayload.status || "draft",
          publishedAt: formPayload.publishedAt
            ? new Date(formPayload.publishedAt)
            : new Date(),
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
      //
      // await tx.insert(formAnalytics).values({
      //   formId: newForm.id,
      //   analyticsDate: new Date(),
      //   views: 0,
      //   uniqueViews: 0,
      //   submissions: 0,
      // });

      return newForm;
    } catch (e: any) {
      await tx.rollback();
      throw e;
    }
  });
};

export async function getFormById(formId: string, token?: string) {
  try {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(formId);
    const form = await db.query.forms.findFirst({
      where: isUUID
        ? or(
            eq(forms.id, formId),
            eq(sql`lower(${forms.slug})`, formId.toLowerCase()),
          )
        : eq(sql`lower(${forms.slug})`, formId.toLowerCase()),
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
    if (!form) {
      throw Error("Form Not Found");
    }
    if (token) {
      const groupMember = await db.query.formGroupMembers.findFirst({
        where: eq(formGroupMembers.inviteToken, token),
        with: {
          group: {
            with: {
              members: true,
              memberPayments: true,
            },
          },
        },
      });
      if (groupMember && groupMember.group.formId == formId) {
        let memberPayment = await db.query.formGroupMemberPayments.findFirst({
          where: and(
            eq(formGroupMemberPayments.groupId, groupMember.groupId),
            eq(formGroupMemberPayments.memberId, groupMember.id),
          ),
        });
        if (memberPayment && memberPayment.paymentType == "leader_pays") {
          form.price = (
            parseInt(form.price || "0") - memberPayment.amount
          ).toString();
        }
      }
    }

    return form;
  } catch (error: any) {
    console.error("Error fetching form by ID:", error);
    throw new Error(error.message || "Failed to retrieve form.");
  }
}
export const updateForm = async (formId: string, payload: FormSchema) => {
  const { stores, pages, createdAt, updatedAt, ...formPayload } = payload;

  return db.transaction(async (tx) => {
    try {
      // Check if form exists
      const existingForm = await tx.query.forms.findFirst({
        where: eq(forms.id, formId),
      });

      if (!existingForm) {
        throw new Error("Form not found");
      }

      // Check slug uniqueness (exclude current form)
      if (formPayload.slug !== existingForm.slug) {
        const duplicateSlug = await tx.query.forms.findFirst({
          where: and(eq(forms.slug, formPayload.slug), ne(forms.id, formId)),
          columns: { id: true },
        });

        if (duplicateSlug) {
          throw new Error(
            `A form with the slug "${formPayload.slug}" already exists. Please choose a different slug.`,
          );
        }
      }

      // 1. Update the Form
      const [updatedForm] = await tx
        .update(forms)
        .set({
          ...formPayload,
          slug: slugify(formPayload.slug),
          publishedAt: formPayload.publishedAt
            ? new Date(formPayload.publishedAt)
            : undefined,
          // updatedAt: new Date(),
        })
        .where(eq(forms.id, formId))
        .returning();

      // 2. Handle Pages
      const existingPageIds: string[] = [];
      const existingFieldIds: string[] = [];

      for (const page of pages) {
        let pageId: string;

        if (page.id && isValidUUID(page.id.toString())) {
          // Update existing page
          const [updatedPage] = await tx
            .update(formPages)
            .set({
              title: page.title,
              description: page.description,
              orderIndex: page.orderIndex,
            })
            .where(eq(formPages.id, page.id))
            .returning();

          if (updatedPage) {
            pageId = updatedPage.id;
            existingPageIds.push(pageId);
          } else {
            throw new Error(`Page with id ${page.id} not found`);
          }
        } else {
          // Create new page
          const [newPage] = await tx
            .insert(formPages)
            .values({
              formId: updatedForm.id,
              title: page.title,
              description: page.description,
              orderIndex: page.orderIndex,
              // createdAt: new Date(),
            })
            .returning();

          if (newPage) {
            pageId = newPage.id;
            existingPageIds.push(pageId);
          } else {
            throw new Error("Failed to create new page");
          }
        }

        // 3. Handle Fields for this page
        for (const fieldPayload of page.fields) {
          const { id, createdAt, updatedAt, ...fieldData } = fieldPayload;

          if (id && isValidUUID(id)) {
            // Update existing field
            const [updatedField] = await tx
              .update(formFields)
              .set({
                ...fieldData,
                type: fieldPayload.type,
                name:
                  fieldPayload.label.split(" ").join("_").toLowerCase() +
                  "_" +
                  fieldPayload.name,
              })
              .where(eq(formFields.id, id))
              .returning();

            if (updatedField) {
              existingFieldIds.push(updatedField.id);
            }
          } else {
            // Create new field
            const [newField] = await tx
              .insert(formFields)
              .values({
                ...fieldData,
                pageId: pageId,
                // createdAt: new Date(),
                type: fieldPayload.type,
                name:
                  fieldPayload.label.split(" ").join("_").toLowerCase() +
                  "_" +
                  fieldPayload.name,
              })
              .returning();

            if (newField) {
              existingFieldIds.push(newField.id);
            }
          }
        }
      }

      // 4. Remove pages that are no longer in the form (only if they have no submissions)
      if (existingPageIds.length > 0) {
        await tx
          .delete(formPages)
          .where(
            and(
              eq(formPages.formId, formId),
              notInArray(formPages.id, existingPageIds),
            ),
          );
      }

      // 5. Remove fields that are no longer in the form (only if they have no submissions)
      if (existingFieldIds.length > 0) {
        await tx
          .delete(formFields)
          .where(
            and(
              inArray(formFields.pageId, existingPageIds),
              notInArray(formFields.id, existingFieldIds),
            ),
          );
      }

      const existingStoreIds: string[] = [];
      const existingStoreItemIds: string[] = [];

      if (stores && stores.length > 0) {
        for (const store of stores) {
          let storeId: string;

          if (store.id && isValidUUID(store.id)) {
            // Update existing store
            const [updatedStore] = await tx
              .update(formStores)
              .set({
                name: store.name,
                description: store.description,
              })
              .where(
                and(eq(formStores.id, store.id), eq(formStores.formId, formId)),
              )
              .returning();

            if (updatedStore) {
              storeId = updatedStore.id;
              existingStoreIds.push(storeId);
            } else {
              throw new Error(`Store with id ${store.id} not found`);
            }
          } else {
            // Create new store
            const [newStore] = await tx
              .insert(formStores)
              .values({
                formId: formId,
                name: store.name,
                description: store.description,
              })
              .returning();

            if (newStore) {
              storeId = newStore.id;
              existingStoreIds.push(storeId);
            } else {
              throw new Error("Failed to create new store");
            }
          }

          // Handle store items
          for (const item of store.items) {
            if (item.id && isValidUUID(item.id)) {
              // Update existing item
              const [updatedItem] = await tx
                .update(storeItems)
                .set({
                  isInfinite: item.infinite,
                  price: item.price.toString(),
                  quantity: item.quantity,
                  images: item.images,
                  name: item.name,
                  description: item.description,
                })
                .where(eq(storeItems.id, item.id))
                .returning();

              if (updatedItem) {
                existingStoreItemIds.push(updatedItem.id);
              } else {
                throw new Error(`Store item with id ${item.id} not found`);
              }
            } else {
              // Create new item
              const [newItem] = await tx
                .insert(storeItems)
                .values({
                  storeId,
                  isInfinite: item.infinite,
                  price: item.price,
                  quantity: item.quantity,
                  images: item.images,
                  name: item.name,
                  description: item.description,
                })
                .returning();

              if (newItem) {
                existingStoreItemIds.push(newItem.id);
              }
            }
          }

          // Delete removed store items
          if (existingStoreItemIds.length > 0) {
            await tx
              .delete(storeItems)
              .where(
                and(
                  eq(storeItems.storeId, store.id),
                  notInArray(storeItems.id, existingStoreItemIds),
                ),
              );
          }
        }
      }
      // Delete removed stores (only those belonging to this form)
      if (existingStoreIds.length > 0) {
        await tx
          .delete(formStores)
          .where(
            and(
              eq(formStores.formId, formId),
              notInArray(formStores.id, existingStoreIds),
            ),
          );
      }
      // 7. Log Activity
      await tx.insert(activities).values({
        userId: updatedForm.createdBy,
        formId: updatedForm.id,
        type: "form_updated",
        description: `Form '${updatedForm.title}' updated.`,
        resourceType: "form",
        resourceId: updatedForm.id,
        // createdAt: new Date(),
        metadata: { title: updatedForm.title, slug: updatedForm.slug },
      });

      return updatedForm;
    } catch (e: any) {
      console.error("Error in updateForm transaction:", e);
      await tx.rollback();
      throw new Error(e.message || "Failed to update form");
    }
  });
}; // Helper function to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
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
