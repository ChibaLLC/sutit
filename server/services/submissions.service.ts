import { SubmissionData } from "~~/shared/types";
import db from "../db";
import {
  fieldResponses,
  formSubmissions,
  storeItems,
  storeResponses,
} from "../db/schema";
import { eq, isNull, isNotNull, and } from "drizzle-orm";
import { getFormById } from "./form.service";
import { processFormPayment } from "./payment.service";

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

    let email = null;
    // 3. Insert field responses
    for (const [fieldId, value] of Object.entries(data.formData)) {
      const stringValue = typeof value === "string" ? value : String(value);

      // Check if it looks like an email address
      if (
        !email &&
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(stringValue)
      ) {
        email = stringValue;
      }
      await tx.insert(fieldResponses).values({
        submissionId: submission.id,
        fieldId,
        value: stringValue,
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
    let pay;
    if (totalPaid > 0) {
      try {
        pay = await processFormPayment(tx, form, {
          ...submission,
          pricePaid: totalPaid,
        });
        if (pay == null || pay == undefined) {
          tx.rollback();
          throw new Error("STK PUSH FAILED");
        }
      } catch (e: any) {
        tx.rollback();
        throw new Error(e);
      }
    }

    return {
      submmission: {
        ...submission,
        pricePaid: totalPaid,
      },
      form: form,
      message:
        totalPaid > 0
          ? "Stk Push Has been sent to your phone Pay"
          : "submitted successfully",
      pay,
    };
  });
};
export const getFormSubmissions = async (formId: string) => {
  let submissions = await db.query.formSubmissions.findMany({
    where: and(
      eq(formSubmissions.formId, formId),
      isNull(formSubmissions.deletedAt),
    ),
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

export const getSubmissionById = async (submissionId: string) => {
  const submission = await db.query.formSubmissions.findFirst({
    where: and(
      eq(formSubmissions.id, submissionId),
      isNull(formSubmissions.deletedAt),
    ),
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
      groupMembers: {
        with: {
          group: {
            with: {
              leader: true,
            },
          },
        },
      },
    },
  });

  if (submission) {
    // Calculate TAT if completed
    if (submission.completedAt && submission.submittedAt) {
      const tatMs =
        new Date(submission.completedAt).getTime() -
        new Date(submission.submittedAt).getTime();
      submission.tat = Math.floor(tatMs / 1000); // in seconds
    } else {
      submission.tat = null;
    }
  }

  return submission;
};

export const updateSubmissionStatus = async (
  submissionId: string,
  status: string,
) => {
  const updateData: any = { status };
  if (status === "completed") {
    updateData.completedAt = new Date();
  }

  await db
    .update(formSubmissions)
    .set(updateData)
    .where(eq(formSubmissions.id, submissionId));
};

export const softDeleteSubmission = async (submissionId: string) => {
  await db
    .update(formSubmissions)
    .set({ deletedAt: new Date() })
    .where(eq(formSubmissions.id, submissionId));
};

export const getDeletedFormSubmissions = async (formId: string) => {
  let submissions = await db.query.formSubmissions.findMany({
    where: and(
      eq(formSubmissions.formId, formId),
      isNotNull(formSubmissions.deletedAt),
    ),
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

export const restoreSubmission = async (submissionId: string) => {
  await db
    .update(formSubmissions)
    .set({ deletedAt: null })
    .where(eq(formSubmissions.id, submissionId));
};

export const permanentDeleteSubmission = async (submissionId: string) => {
  return db.transaction(async (tx) => {
    // Delete related field responses
    await tx
      .delete(fieldResponses)
      .where(eq(fieldResponses.submissionId, submissionId));

    // Delete related store responses
    await tx
      .delete(storeResponses)
      .where(eq(storeResponses.submissionId, submissionId));

    // Delete the submission
    await tx
      .delete(formSubmissions)
      .where(eq(formSubmissions.id, submissionId));
  });
};
