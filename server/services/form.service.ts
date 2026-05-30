import {
  and,
  between,
  eq,
  ilike,
  inArray,
  type InferInsertModel,
  isNull,
  ne,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import type { Filters, FormSchema } from "~~/shared/types";
import { slugify } from "~~/shared/utils/form.schema";

import db from "../db";
import {
  activities,
  events,
  fieldResponses,
  formAnalytics,
  formFields,
  formGroupMemberPayments,
  formGroupMembers,
  formPages,
  forms,
  formStores,
  storeItems,
} from "../db/schema";

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
  const { stores, pages, event: eventPayload, ...formPayload } = payload;
  return db.transaction(async (tx) => {
    try {
      // Generate unique slug by appending user ID
      let uniqueSlug = `${slugify(formPayload.slug)}`;

      const existingForm = await tx.query.forms.findFirst({
        where: eq(forms.slug, formPayload.slug),
        columns: { id: true, slug: true },
      });

      if (existingForm) {
        uniqueSlug = slugify(uniqueSlug + "-" + new Date().getDate().toString());
      }
      // 1. Create the Form
      const [newForm] = await tx
        .insert(forms)
        .values({
          ...formPayload,
          slug: uniqueSlug,
          createdBy: payload.createdBy,
          status: formPayload.status || "draft",
          publishedAt: formPayload.publishedAt ? new Date(formPayload.publishedAt) : new Date(),
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
              fieldPayload.label.split(" ").join("_").toLocaleLowerCase() + "_" + fieldPayload.name,
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

      if (eventPayload && formPayload.hasEvent) {
        let eventSlug = slugify(eventPayload.slug || eventPayload.title);
        const existingEvent = await tx.query.events.findFirst({
          where: eq(events.slug, eventSlug),
        });
        if (existingEvent) {
          eventSlug = slugify(`${eventSlug}-${Date.now().toString(36)}`);
        }

        await tx.insert(events).values({
          formId: newForm.id,
          title: eventPayload.title,
          description: eventPayload.description,
          slug: eventSlug,
          startDate: eventPayload.startDate ? new Date(eventPayload.startDate) : new Date(),
          endDate: eventPayload.endDate ? new Date(eventPayload.endDate) : null,
          timezone: eventPayload.timezone || "UTC",
          venueName: eventPayload.venueName,
          venueAddress: eventPayload.venueAddress,
          venueMapUrl: eventPayload.venueMapUrl,
          contactPhone: eventPayload.contactPhone,
          contactEmail: eventPayload.contactEmail,
          category: eventPayload.category,
          audience: eventPayload.audience,
          images: eventPayload.images || [],
          isFeatured: eventPayload.isFeatured || false,
          isFree: eventPayload.isFree !== undefined ? eventPayload.isFree : true,
          refundPolicy: eventPayload.refundPolicy,
          status: (eventPayload.status as any) || "upcoming",
          publishedAt: new Date(),
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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(formId);
    const form = await db.query.forms.findFirst({
      where: isUUID
        ? or(eq(forms.id, formId), eq(sql`lower(${forms.slug})`, formId.toLowerCase()))
        : eq(sql`lower(${forms.slug})`, formId.toLowerCase()),
      with: {
        pages: {
          with: {
            fields: {
              orderBy: (fields, { asc }) => [asc(fields.orderIndex)],
            },
          },
          orderBy: (pages, { asc }) => [asc(pages.orderIndex)],
          where: eq(formFields.deletedAt, isNull(formFields.deletedAt)),
        },
        creator: {
          columns: { id: true, email: true, name: true },
        },
        stores: {
          with: {
            items: true,
          },
          where: eq(formFields.deletedAt, isNull(formFields.deletedAt)),
        },
        event: true,
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
      if (groupMember) {
        let memberPayment = await db.query.formGroupMemberPayments.findFirst({
          where: and(
            eq(formGroupMemberPayments.groupId, groupMember.groupId),
            eq(formGroupMemberPayments.memberId, groupMember.id),
          ),
        });
        if (memberPayment && memberPayment.paymentType == "leader_pays") {
          form.price = "0".toString();
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
  const { stores, pages, createdAt, updatedAt, event: eventPayload, ...formPayload } = payload;

  return db.transaction(async (tx) => {
    try {
      // Check if form exists
      const existingForm = await tx.query.forms.findFirst({
        where: eq(forms.id, formId),
      });

      if (!existingForm) {
        throw new Error("Form not found");
      }

      // // Generate unique slug by appending user ID
      // const uniqueSlug = `${slugify(formPayload.slug)}-${existingForm.createdBy}`;
      //
      // // Check slug uniqueness (exclude current form)
      // if (uniqueSlug !== existingForm.slug) {
      //   const duplicateSlug = await tx.query.forms.findFirst({
      //     where: and(eq(forms.slug, uniqueSlug), ne(forms.id, formId)),
      //     columns: { id: true },
      //   });
      //
      //   if (duplicateSlug) {
      //     throw new Error(
      //       `A form with the slug "${formPayload.slug}" already exists. Please choose a different slug.`,
      //     );
      //   }
      // }

      // 1. Update the Form
      const [updatedForm] = await tx
        .update(forms)
        .set({
          ...formPayload,
          publishedAt: formPayload.publishedAt ? new Date(formPayload.publishedAt) : undefined,
          updatedAt: new Date(), // Enable this to track updates
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
              updatedAt: new Date(),
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
                  fieldPayload.label.split(" ").join("_").toLowerCase() + "_" + fieldPayload.name,
                pageId: pageId, // Ensure field is linked to correct page
                updatedAt: new Date(),
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
                type: fieldPayload.type,
                name:
                  fieldPayload.label.split(" ").join("_").toLowerCase() + "_" + fieldPayload.name,
              })
              .returning();

            if (newField) {
              existingFieldIds.push(newField.id);
            }
          }
        }
      }

      // 4. Soft delete pages not in the update
      if (existingPageIds.length > 0) {
        await tx
          .update(formPages)
          .set({ deletedAt: sql`now()` })
          .where(
            and(
              eq(formPages.formId, formId),
              notInArray(formPages.id, existingPageIds),
              isNull(formPages.deletedAt), // Fixed: use isNull instead of eq(null)
            ),
          );
      }

      // 5. Delete fields that are no longer in the form
      console.log("Existing field IDs:", existingFieldIds);

      // Get fields only from pages that are being updated (existingPageIds)
      const fieldsToCheck = await tx
        .select({ id: formFields.id })
        .from(formFields)
        .where(and(inArray(formFields.pageId, existingPageIds), isNull(formFields.deletedAt)));

      const currentFieldIds = fieldsToCheck.map((f) => f.id);
      console.log("Current field IDs in updated pages:", currentFieldIds);

      const fieldsToDelete = currentFieldIds.filter((id) => !existingFieldIds.includes(id));

      console.log("Fields to delete:", fieldsToDelete);

      if (fieldsToDelete.length > 0) {
        // Delete all field responses for the removed fields
        const deletedResponses = await tx
          .delete(fieldResponses)
          .where(inArray(fieldResponses.fieldId, fieldsToDelete))
          .returning();
        console.log("Deleted responses:", deletedResponses.length);

        // Then delete the fields themselves
        const deletedFields = await tx
          .delete(formFields)
          .where(inArray(formFields.id, fieldsToDelete))
          .returning();
        console.log("Deleted fields:", deletedFields.length);
      } else {
        console.log("No fields to delete");
      }

      // 6. Handle Stores
      const existingStoreIds: string[] = [];

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
                updatedAt: new Date(),
              })
              .where(and(eq(formStores.id, store.id), eq(formStores.formId, formId)))
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

          // Handle store items for this specific store
          const existingStoreItemIds: string[] = [];

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
                  updatedAt: new Date(),
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

          // Soft delete removed store items (FIXED: use storeId, not store.id)
          if (existingStoreItemIds.length > 0) {
            await tx
              .update(storeItems)
              .set({ deletedAt: sql`now()` })
              .where(
                and(
                  eq(storeItems.storeId, storeId), // FIXED: was store.id
                  notInArray(storeItems.id, existingStoreItemIds),
                  isNull(storeItems.deletedAt), // Fixed: use isNull
                ),
              );
          }
        }
      }

      // Soft delete stores not in the update
      if (existingStoreIds.length > 0) {
        await tx
          .update(formStores)
          .set({ deletedAt: sql`now()` })
          .where(
            and(
              eq(formStores.formId, formId),
              notInArray(formStores.id, existingStoreIds),
              isNull(formStores.deletedAt), // Fixed: use isNull
            ),
          );
      }

      // 7. Handle Event
      const existingEvent = await tx.query.events.findFirst({
        where: eq(events.formId, formId),
      });

      if (formPayload.hasEvent && eventPayload) {
        let eventSlug = slugify(eventPayload.slug || eventPayload.title);
        const existingSlug = await tx.query.events.findFirst({
          where: and(eq(events.slug, eventSlug), existingEvent ? ne(events.id, existingEvent.id) : undefined),
        });
        if (existingSlug) {
          eventSlug = slugify(`${eventSlug}-${Date.now().toString(36)}`);
        }

        const eventData = {
          title: eventPayload.title,
          description: eventPayload.description,
          slug: eventSlug,
          startDate: eventPayload.startDate ? new Date(eventPayload.startDate) : new Date(),
          endDate: eventPayload.endDate ? new Date(eventPayload.endDate) : null,
          timezone: eventPayload.timezone || "UTC",
          venueName: eventPayload.venueName,
          venueAddress: eventPayload.venueAddress,
          venueMapUrl: eventPayload.venueMapUrl,
          contactPhone: eventPayload.contactPhone,
          contactEmail: eventPayload.contactEmail,
          category: eventPayload.category,
          audience: eventPayload.audience,
          images: eventPayload.images || [],
          isFeatured: eventPayload.isFeatured || false,
          isFree: eventPayload.isFree !== undefined ? eventPayload.isFree : true,
          refundPolicy: eventPayload.refundPolicy,
          status: (eventPayload.status as any) || "upcoming",
          updatedAt: new Date(),
        };

        if (existingEvent) {
          await tx.update(events).set(eventData).where(eq(events.id, existingEvent.id));
        } else {
          await tx.insert(events).values({
            formId,
            ...eventData,
            createdAt: new Date(),
            publishedAt: new Date(),
          });
        }
      } else if (!formPayload.hasEvent && existingEvent) {
        await tx.delete(events).where(eq(events.id, existingEvent.id));
      }

      // 8. Log Activity
      await tx.insert(activities).values({
        userId: updatedForm.createdBy,
        formId: updatedForm.id,
        type: "form_updated",
        description: `Form '${updatedForm.title}' updated.`,
        resourceType: "form",
        resourceId: updatedForm.id,
        metadata: { title: updatedForm.title, slug: updatedForm.slug },
      });

      return updatedForm;
    } catch (e: any) {
      console.error("Error in updateForm transaction:", e);
      tx.rollback();
      throw new Error(e.message || "Failed to update form");
    }
  });
};

// Helper function to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function deleteForm(formId: string, deleterId: string) {
  return db.transaction(async (tx) => {
    const [existingForm] = await tx.select().from(forms).where(eq(forms.id, formId));
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

export const acceptResponse = async (formId: string) => {
  try {
    const form = await getFormById(formId);

    if (!form) {
      throw new Error("Form not found");
    }

    const res = await db
      .update(forms)
      .set({ acceptResponses: !form.acceptResponses })
      .where(eq(forms.id, formId))
      .returning();

    return res[0];
  } catch (e) {
    throw new Error("An error occurred");
  }
};

interface ShareSettings {
  isPublic?: boolean;
  requirePassword?: boolean;
  password?: string | null;
  expiresAt?: string | null;
  requiresLogin?: boolean;
  acceptResponses?: boolean;
}

export const updateShareSettings = async (formId: string, settings: ShareSettings) => {
  try {
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form) {
      throw new Error("Form not found");
    }

    const updateData: Partial<typeof forms.$inferInsert> = {};

    if (settings.isPublic !== undefined) {
      updateData.isPublic = settings.isPublic;
    }

    if (settings.requirePassword !== undefined) {
      updateData.requirePassword = settings.requirePassword;
    }

    if (settings.password !== undefined) {
      updateData.password = settings.password || null;
    }

    if (settings.expiresAt !== undefined) {
      updateData.expiresAt = settings.expiresAt ? new Date(settings.expiresAt) : null;
    }

    if (settings.requiresLogin !== undefined) {
      updateData.requiresLogin = settings.requiresLogin;
    }

    if (settings.acceptResponses !== undefined) {
      updateData.acceptResponses = settings.acceptResponses;
    }

    updateData.updatedAt = new Date();

    const [updatedForm] = await db
      .update(forms)
      .set(updateData)
      .where(eq(forms.id, formId))
      .returning();

    return updatedForm;
  } catch (e) {
    console.error("Error updating share settings:", e);
    throw new Error(e instanceof Error ? e.message : "Failed to update share settings");
  }
};
