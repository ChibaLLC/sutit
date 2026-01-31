import { SubmissionData } from "~~/shared/types";
import db from "../db";
import {
  fieldResponses,
  formPayments,
  formSubmissions,
  storeItems,
  storeResponses,
  payments,
} from "../db/schema";
import { eq, isNull, isNotNull, and, inArray, sql } from "drizzle-orm";
import { getFormById } from "./form.service";
import { processFormPayment } from "./payment.service";
import { sendMail } from "./email.service";
import { sendTextSmsTiara } from "../utils/sms/tiara";
import { randomBytes } from "crypto";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Check if user has existing submission for this form
export const checkExistingSubmission = async (formId: string, userId: string) => {
  const existingSubmission = await db.query.formSubmissions.findFirst({
    where: and(
      eq(formSubmissions.formId, formId),
      eq(formSubmissions.submitterId, userId),
      isNull(formSubmissions.deletedAt),
    ),
  });
  
  return existingSubmission;
};

// Get submission count for a form
export const getSubmissionCount = async (formId: string): Promise<number> => {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(formSubmissions)
    .where(and(
      eq(formSubmissions.formId, formId),
      isNull(formSubmissions.deletedAt),
    ));
  
  return result[0]?.count || 0;
};

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
    const accessToken = generateToken();
    const [submission] = await tx
      .insert(formSubmissions)
      .values({
        formId: form.id,
        submitterId,
        status: parseInt(form.price || "0") > 0 ? "pending" : "completed",
        metadata: {
          paymentData: data.paymentData ?? null,
          accessToken, // Store access token for unauthenticated users
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

        // Update submission metadata with token data for phone verification
        if (pay.phoneNumber) {
          await tx
            .update(formSubmissions)
            .set({
              metadata: {
                ...submission.metadata,
                tokenData: {
                  phoneNumber: pay.phoneNumber,
                  generatedAt: new Date().toISOString(),
                },
              },
            })
            .where(eq(formSubmissions.id, submission.id));
        }

        // For paid submissions, we'll send notifications after payment confirmation
        // in the M-Pesa callback
      } catch (e: any) {
        tx.rollback();
        throw new Error(e);
      }
    } else {
      const baseUrl =
        process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const stopTatUrl =
        totalPaid > 0
          ? `${baseUrl}/submission/${submission.id}/stop-tat?token=${accessToken}`
          : `${baseUrl}/submission/${submission.id}/stop-tat`;
      // For free submissions (no payment), send stop TAT notification immediately
      if (email) {
        try {
          await sendStopTatNotification(email, form.title, stopTatUrl);
        } catch (error) {
          console.error(
            "Failed to send stop TAT notification for free submission:",
            error,
          );
        }
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
      payments: {
        with: {
          payment: true,
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
      payments: {
        with: {
          payment: true,
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

export const stopSubmissionTAT = async (submissionId: string) => {
  const updateData: any = {
    completedAt: new Date(),
    status: "completed",
  };
  const [submission] = await db
    .update(formSubmissions)
    .set(updateData)
    .where(eq(formSubmissions.id, submissionId))
    .returning();
  return submission;
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
    // Get payment IDs associated with this submission before deleting formPayments
    const formPaymentRecords = await tx
      .select({ paymentId: formPayments.paymentId })
      .from(formPayments)
      .where(eq(formPayments.submissionId, submissionId));

    // Delete related field responses
    await tx
      .delete(fieldResponses)
      .where(eq(fieldResponses.submissionId, submissionId));

    // Delete related store responses
    await tx
      .delete(storeResponses)
      .where(eq(storeResponses.submissionId, submissionId));

    // Delete the actual payment records
    if (formPaymentRecords.length > 0) {
      const paymentIds = formPaymentRecords.map((record) => record.paymentId);
      await tx.delete(payments).where(inArray(payments.id, paymentIds));
    }

    // Delete related form payments
    await tx
      .delete(formPayments)
      .where(eq(formPayments.submissionId, submissionId));

    // Delete the submission
    await tx
      .delete(formSubmissions)
      .where(eq(formSubmissions.id, submissionId));
  });
};

export const sendStopTatNotification = async (
  email: string,
  formTitle: string,
  stopTatUrl: string,
) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .button:hover { background: #5568d3; }
          .footer { background: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Form Submission Received</h1>
          </div>
          <div class="content">
            <h2>Thank you for your submission!</h2>
            <p>Your response to <strong>${formTitle}</strong> has been successfully recorded.</p>
            
            <p><strong>Stop Your Turnaround Time (TAT)</strong></p>
            <p>To stop the TAT timer for your submission, click the button below:</p>
            
            <a href="${stopTatUrl}" class="button">Stop TAT</a>
            
            <p>Or copy this link to your browser:</p>
            <p style="word-break: break-all; color: #666;">${stopTatUrl}</p>
            
            <p><em>This link will allow you to stop the TAT timer when your request has been processed.</em></p>
          </div>
          <div class="footer">
            <p>Powered by Sutit Forms</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: `Stop TAT - ${formTitle}`,
    html,
  });
};
