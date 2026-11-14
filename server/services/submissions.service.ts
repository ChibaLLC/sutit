import { randomBytes, timingSafeEqual } from "crypto";

import { eq, isNull, isNotNull, and, inArray, sql, desc } from "drizzle-orm";
import { SubmissionData } from "~~/shared/types";

import db from "../db";
import {
  fieldResponses,
  formGroupMembers,
  formPayments,
  formSubmissions,
  storeItems,
  storeResponses,
  payments,
} from "../db/schema";
import { sendTextSmsTiara } from "../utils/sms/tiara";
import { sendMail } from "./email.service";
import { getFormById } from "./form.service";
import { processFormPayment } from "./payment.service";

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
    with: {
      payments: {
        with: {
          payment: true,
        },
      },
    },
  });

  return existingSubmission;
};

// Check if user has a failed payment submission for this form
export const checkFailedPaymentSubmission = async (formId: string, userId: string) => {
  const failedSubmission = await db.query.formSubmissions.findFirst({
    where: and(
      eq(formSubmissions.formId, formId),
      eq(formSubmissions.submitterId, userId),
      eq(formSubmissions.status, "failed_payment"),
      isNull(formSubmissions.deletedAt),
    ),
  });

  return failedSubmission;
};

// Get submission count for a form
export const getSubmissionCount = async (formId: string): Promise<number> => {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(formSubmissions)
    .where(and(eq(formSubmissions.formId, formId), isNull(formSubmissions.deletedAt)));

  return result[0]?.count || 0;
};

export const submitForm = async (
  formId: string,
  data: SubmissionData,
  submitterId?: string,
  existingSubmissionId?: string,
  inviteToken?: string,
) => {
  return db.transaction(async (tx) => {
    // 1. Get form (to read base price), pass token so group member price is waived
    const form = await getFormById(formId, inviteToken);

    if (!form) {
      throw new Error(`Form not found: ${formId}`);
    }

    let submission: any;

    if (existingSubmissionId) {
      // If we have an existing submission ID, update that submission instead of creating new
      const existingSubmission = await tx.query.formSubmissions.findFirst({
        where: and(
          eq(formSubmissions.id, existingSubmissionId),
          eq(formSubmissions.formId, formId),
          isNull(formSubmissions.deletedAt),
        ),
      });

      if (!existingSubmission) {
        throw new Error(`Existing submission not found: ${existingSubmissionId}`);
      }

      // Update the existing submission
      submission = await tx
        .update(formSubmissions)
        .set({
          status: parseInt(form.price || "0") > 0 ? "pending" : "completed",
          metadata: {
            paymentData: data.paymentData ?? null,
            accessToken: generateToken(), // Generate new access token
          },
          pricePaid: 0, // will be updated after we compute total
        })
        .where(eq(formSubmissions.id, existingSubmissionId))
        .returning();
    } else {
      // 2. Create new submission (original logic)
      const accessToken = generateToken();
      const [newSubmission] = await tx
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

      submission = newSubmission;
    }

    if (!submission) {
      tx.rollback();
      throw new Error("Failed to create/update submission");
    }

    if (inviteToken) {
      await tx
        .update(formGroupMembers)
        .set({ submissionId: submission.id })
        .where(eq(formGroupMembers.inviteToken, inviteToken));
    }

    let email: string | null = null;
    let subPhoneNumber: string | null = null;
    // 3. Insert field responses
    for (const [fieldId, value] of Object.entries(data.formData)) {
      const stringValue = typeof value === "string" ? value : String(value);

      // Check if it looks like an email address
      if (!email && /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(stringValue)) {
        email = stringValue;
      }

      // Check if it looks like a Kenyan phone number, normalize to 254...
      if (!subPhoneNumber) {
        const digits = stringValue.replace(/\D/g, "");
        if (/^254[17]\d{8}$/.test(digits)) {
          subPhoneNumber = digits;
        } else if (/^0[17]\d{8}$/.test(digits)) {
          subPhoneNumber = `254${digits.slice(1)}`;
        } else if (/^[17]\d{8}$/.test(digits)) {
          subPhoneNumber = `254${digits}`;
        }
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

    for (const [itemId, { quantity }] of Object.entries(data.selectedProducts)) {
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
      } catch (e: any) {
        tx.rollback();
        throw new Error(e);
      }
    } else {
      if (subPhoneNumber && form.afterSubmissionMessage) {
        await sendTextSmsTiara({ phone: subPhoneNumber, message: form.afterSubmissionMessage });
      }

      if (form.calculateTat) {
        const baseUrl = process.env.BETTER_AUTH_URL;
        const stopTatUrl =
          totalPaid > 0
            ? `${baseUrl}/submission/${submission.id}/stop-tat?token=${submission.metadata?.accessToken}`
            : `${baseUrl}/submission/${submission.id}/stop-tat`;
        // For free submissions (no payment), send stop TAT notification immediately
        if (email) {
          try {
            await sendStopTatNotification(email, form.title, stopTatUrl);
          } catch (error) {
            console.error("Failed to send stop TAT notification for free submission:", error);
          }
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
        totalPaid > 0 ? "Stk Push Has been sent to your phone Pay" : "submitted successfully",
      pay,
    };
  });
};
export const getFormSubmissions = async (formId: string) => {
  let submissions = await db.query.formSubmissions.findMany({
    where: and(eq(formSubmissions.formId, formId), isNull(formSubmissions.deletedAt)),
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
          payment: {
            with: {
              disbursements: {
                orderBy: (d, { desc }) => [desc(d.createdAt)],
              },
            },
          },
        },
      },
      submitter: true,
      dispatch: true,
      groupMembers: {
        with: {
          group: true,
        },
      },
    },
  });
  return submissions;
};

export const getSubmissionById = async (submissionId: string) => {
  const submission = await db.query.formSubmissions.findFirst({
    where: and(eq(formSubmissions.id, submissionId), isNull(formSubmissions.deletedAt)),
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
        orderBy: [desc(formPayments.createdAt)],
        with: {
          payment: {
            with: {
              disbursements: {
                orderBy: (d, { desc }) => [desc(d.createdAt)],
              },
            },
          },
        },
      },
      dispatch: true,
    },
  });

  if (submission) {
    // Calculate TAT if completed
    if (submission.completedAt && submission.submittedAt) {
      const tatMs =
        new Date(submission.completedAt).getTime() - new Date(submission.submittedAt).getTime();
      submission.tat = Math.floor(tatMs / 1000); // in seconds
    } else {
      submission.tat = null;
    }
  }

  return submission;
};

export const updateSubmissionStatus = async (submissionId: string, status: string) => {
  const updateData: any = { status };
  if (status === "completed") {
    updateData.completedAt = new Date();
  }

  await db.update(formSubmissions).set(updateData).where(eq(formSubmissions.id, submissionId));
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
    where: and(eq(formSubmissions.formId, formId), isNotNull(formSubmissions.deletedAt)),
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
    await tx.delete(fieldResponses).where(eq(fieldResponses.submissionId, submissionId));

    // Delete related store responses
    await tx.delete(storeResponses).where(eq(storeResponses.submissionId, submissionId));

    // Delete the actual payment records
    if (formPaymentRecords.length > 0) {
      const paymentIds = formPaymentRecords.map((record) => record.paymentId);
      await tx.delete(payments).where(inArray(payments.id, paymentIds));
    }

    // Delete related form payments
    await tx.delete(formPayments).where(eq(formPayments.submissionId, submissionId));

    // Delete the submission
    await tx.delete(formSubmissions).where(eq(formSubmissions.id, submissionId));
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

// ============================================
// EVENT CHECK-IN (stored in form_submissions.metadata.checkin)
// ============================================

export type SubmissionCheckin = {
  /** Short secret used in the participant link / QR code */
  code?: string;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
  distanceKm?: number | null;
  distanceRecordedAt?: string | null;
  distanceRecordedBy?: string | null;
  distanceSource?: "organizer" | "participant" | null;
  passSmsSentAt?: string | null;
  distanceSmsSentAt?: string | null;
};

/** Merges `patch` into metadata.checkin with a single atomic jsonb update. */
const mergeCheckinSql = (patch: Record<string, unknown>) =>
  sql`jsonb_set(coalesce(${formSubmissions.metadata}, '{}'::jsonb), '{checkin}',
    coalesce(${formSubmissions.metadata}->'checkin', '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb)`;

/** Parses a distance from user input. Returns null for empty input; throws on invalid input. */
export const parseDistanceKm = (raw: unknown): number | null => {
  if (raw === null || raw === undefined || raw === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: "Distance must be a number between 0 and 1000 km",
    });
  }
  return Math.round(value * 100) / 100;
};

/** Normalizes Kenyan phone numbers to 2547XXXXXXXX / 2541XXXXXXXX, or null. */
export const normalizeKenyanPhone = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const digits = String(value).replace(/\D/g, "");
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return null;
};

/**
 * Phone to contact a participant on: the number that completed the M-Pesa payment,
 * falling back to a phone number entered in the form. Expects `payments.payment` and `responses.field`.
 */
export const getSubmissionPhone = (submission: any): string | null => {
  const paid = (submission.payments || []).find((fp: any) => fp.payment?.status === "completed");
  const fromPayment = normalizeKenyanPhone(paid?.payment?.phoneNumber);
  if (fromPayment) return fromPayment;

  const responses = submission.responses || [];
  const phoneField = responses.find((r: any) => r.field?.type === "phone");
  const fromField = normalizeKenyanPhone(phoneField?.value);
  if (fromField) return fromField;

  for (const r of responses) {
    const phone = normalizeKenyanPhone(r.value);
    if (phone) return phone;
  }
  return null;
};

/** Best-effort display name: account name, else a form field labelled like "name". */
export const getSubmissionDisplayName = (submission: any): string => {
  if (submission.submitter?.name) return submission.submitter.name;
  const responses = submission.responses || [];
  const nameField =
    responses.find((r: any) => /full\s*name/i.test(r.field?.label || "")) ||
    responses.find((r: any) => /name/i.test(r.field?.label || "") && !/email/i.test(r.field?.label || ""));
  return nameField?.value?.toString().trim() || "Participant";
};

/** Returns the participant's check-in code, creating and saving one if it doesn't exist yet. */
export const ensureCheckinCode = async (submissionId: string, metadata: any): Promise<string> => {
  if (metadata?.checkin?.code) return metadata.checkin.code;

  const code = randomBytes(9).toString("base64url"); // 12 URL-safe chars
  const [updated] = await db
    .update(formSubmissions)
    .set({ metadata: mergeCheckinSql({ code }) })
    .where(
      and(
        eq(formSubmissions.id, submissionId),
        sql`(${formSubmissions.metadata}->'checkin'->>'code') is null`,
      ),
    )
    .returning();

  if (updated) return code;

  // Someone else generated one concurrently - use theirs.
  const current = await db.query.formSubmissions.findFirst({
    where: eq(formSubmissions.id, submissionId),
  });
  return (current?.metadata as any)?.checkin?.code;
};

export const getParticipantUrl = (submissionId: string, code: string) =>
  `${process.env.BETTER_AUTH_URL}/p/${submissionId}?c=${code}`;

const codesMatch = (expected: string | undefined, given: string | undefined) => {
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * Loads a submission for the public participant page, verifying the check-in code.
 * Wrong IDs and wrong codes give the same 404, so codes can't be probed.
 */
export const getSubmissionByCheckinCode = async (submissionId: string, code: string | undefined) => {
  const notFound = createError({ statusCode: 404, statusMessage: "Invalid or expired link" });
  if (!/^[0-9a-f-]{36}$/i.test(submissionId)) throw notFound;

  const submission = await db.query.formSubmissions.findFirst({
    where: and(eq(formSubmissions.id, submissionId), isNull(formSubmissions.deletedAt)),
    with: {
      form: true,
      submitter: true,
      responses: { with: { field: true } },
    },
  });

  if (!submission || !codesMatch((submission.metadata as any)?.checkin?.code, code)) throw notFound;
  return submission;
};

/** Marks that an SMS of the given kind was sent to this participant. */
export const markCheckinSmsSent = async (submissionId: string, kind: "pass" | "distance") => {
  const key = kind === "pass" ? "passSmsSentAt" : "distanceSmsSentAt";
  await db
    .update(formSubmissions)
    .set({ metadata: mergeCheckinSql({ [key]: new Date().toISOString() }) })
    .where(eq(formSubmissions.id, submissionId));
};

const findFormSubmission = (formId: string, submissionId: string) =>
  db.query.formSubmissions.findFirst({
    where: and(
      eq(formSubmissions.id, submissionId),
      eq(formSubmissions.formId, formId),
      isNull(formSubmissions.deletedAt),
    ),
  });

/**
 * Atomically checks in a submission. Only succeeds once: a second call returns
 * `{ alreadyCheckedIn: true }` with the original check-in details.
 */
export const checkInSubmission = async (formId: string, submissionId: string, userId: string) => {
  const existing = await findFormSubmission(formId, submissionId);
  if (!existing) throw createError({ statusCode: 404, statusMessage: "Submission not found" });

  if (existing.status !== "completed") {
    throw createError({
      statusCode: 400,
      statusMessage: `Cannot check in a submission with status "${existing.status}" (payment not completed)`,
    });
  }

  const checkin: SubmissionCheckin = {
    ...(existing.metadata as any)?.checkin,
    checkedInAt: new Date().toISOString(),
    checkedInBy: userId,
  };

  // The WHERE clause guards against two staff checking in the same person at once.
  const [updated] = await db
    .update(formSubmissions)
    .set({
      metadata: sql`jsonb_set(coalesce(${formSubmissions.metadata}, '{}'::jsonb), '{checkin}', ${JSON.stringify(checkin)}::jsonb)`,
    })
    .where(
      and(
        eq(formSubmissions.id, submissionId),
        eq(formSubmissions.formId, formId),
        sql`(${formSubmissions.metadata}->'checkin'->>'checkedInAt') is null`,
      ),
    )
    .returning();

  if (!updated) {
    const current = await findFormSubmission(formId, submissionId);
    return {
      alreadyCheckedIn: true,
      checkin: ((current?.metadata as any)?.checkin || null) as SubmissionCheckin | null,
    };
  }

  return { alreadyCheckedIn: false, checkin: (updated.metadata as any).checkin as SubmissionCheckin };
};

/** Clears the check-in time (for mistakes). Leaves any recorded distance intact. */
export const undoCheckInSubmission = async (formId: string, submissionId: string) => {
  const existing = await findFormSubmission(formId, submissionId);
  if (!existing) throw createError({ statusCode: 404, statusMessage: "Submission not found" });

  const [updated] = await db
    .update(formSubmissions)
    .set({ metadata: mergeCheckinSql({ checkedInAt: null, checkedInBy: null }) })
    .where(eq(formSubmissions.id, submissionId))
    .returning();

  return (updated.metadata as any).checkin as SubmissionCheckin;
};

/** Sets (or clears, with null) the distance covered. The submission must be checked in first. */
export const recordSubmissionDistance = async (
  formId: string,
  submissionId: string,
  distanceKm: number | null,
  recordedBy: { source: "organizer"; userId: string } | { source: "participant" },
) => {
  const existing = await findFormSubmission(formId, submissionId);
  if (!existing) throw createError({ statusCode: 404, statusMessage: "Submission not found" });

  if (!(existing.metadata as any)?.checkin?.checkedInAt) {
    throw createError({
      statusCode: 400,
      statusMessage: "Check in this submission before recording a distance",
    });
  }

  const cleared = distanceKm === null;
  const patch = {
    distanceKm,
    distanceRecordedAt: cleared ? null : new Date().toISOString(),
    distanceRecordedBy: cleared || recordedBy.source !== "organizer" ? null : recordedBy.userId,
    distanceSource: cleared ? null : recordedBy.source,
  };

  const [updated] = await db
    .update(formSubmissions)
    .set({ metadata: mergeCheckinSql(patch) })
    .where(eq(formSubmissions.id, submissionId))
    .returning();

  return (updated.metadata as any).checkin as SubmissionCheckin;
};
