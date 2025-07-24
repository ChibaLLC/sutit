import { payments, stores, storeItems, forms, storesView } from "~~/server/db/schema";
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

export async function createForm(data: z.infer<typeof formBodyData>, { user }: AuthData) {
  const form = (
    await db
      .insert(forms)
      .values({
        blob: data.form.pages,
        meta: {
          glossary: {
            description: data.description,
            inviteMessage: data.payment.group_invite_message,
          },
          price: data.payment.amount
            ? {
                individual: data.payment.amount,
                group: data.payment.group_amount
                  ? {
                      price: data.payment.group_amount,
                      limit: data.payment.group_limit,
                    }
                  : undefined,
              }
            : undefined,
        },
        name: data.name,
        userUlid: user.ulid,
      })
      .returning()
  ).at(0);
  return form;
}

export async function updateForm(formUlid: string, data: z.infer<typeof formBodyData>, user: Drizzle.User.select) {
  const form = await getFormByUlid(formUlid);
  if (!form) {
    throw createError({
      statusCode: 404,
      message: "Unable to find the initial form to edit",
    });
  }

  if (form.meta.userUlid !== user.ulid) {
    throw createError({
      statusCode: 403,
      message: "You are not allowed to edit this form.",
    });
  }

  // Update form metadata
  await db
    .update(forms)
    .set({
      // allowGroups: data.allowGroups,
      // group_invite_message: data.payment.group_invite_message,
      // group_member_count: data.payment.group_limit,
      // price_group: data.payment.group_amount || 0,
      // price_individual: data.payment.amount || 0,
      // formName: data.name,
      // formDescription: data.description,
      // userUlid: user.ulid,
      // requireMerch: data.requireMerch,
      // updatedAt: new Date(),
    })
    .where(eq(forms.ulid, formUlid))
    .execute();
  return form.meta;
}

export async function deleteForm(formUlid: string) {
  return (await db.delete(forms).where(eq(forms.ulid, formUlid)).returning()).at(0);
}

export async function reconstructDbForm(form: Drizzle.SutitForm) {
  if (form.meta.store) {
    var store = (await db.select().from(storesView).where(eq(storesView.storeUlid, form.meta.store.ulid))).at(0);
  }

  return {
    meta: form.meta,
    pages: form.blob,
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
    }, {},
  };
}

export async function getFormByUlid(formUlid: string) {
  const results = (await db.select().from(forms).where(eq(forms.ulid, formUlid))).at(0);
  if (results) {
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
