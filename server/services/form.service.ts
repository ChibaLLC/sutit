import { and, between, eq, ilike, InferInsertModel, or } from "drizzle-orm";
import {
  activities,
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
    } catch (e: any) {
      await tx.rollback();
      throw e;
    }
  });
};

export async function getFormById(formId: string, token?: string) {
  try {
    const form = await db.query.forms.findFirst({
      where: or(eq(forms.id, formId), eq(forms.slug, formId)),
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
