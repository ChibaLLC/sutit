import db from "../db";
import {
  dispatches,
  formSubmissions,
  storeResponses,
  fieldResponses,
} from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { sendMail } from "./email.service";

export const getDispatchBySubmissionId = async (submissionId: string) => {
  return await db.query.dispatches.findFirst({
    where: eq(dispatches.submissionId, submissionId),
  });
};

export const createDispatch = async (
  submissionId: string,
  data: { dispatchedBy: string; dispatchDate: string; notes?: string },
) => {
  const submission = await db.query.formSubmissions.findFirst({
    where: and(
      eq(formSubmissions.id, submissionId),
      isNull(formSubmissions.deletedAt),
    ),
    with: {
      storeResponses: true,
      submitter: true,
      responses: {
        with: {
          field: true,
        },
      },
    },
  });

  if (!submission) throw new Error("Submission not found");
  if (!submission.storeResponses?.length)
    throw new Error("Submission has no products to dispatch");

  const existing = await getDispatchBySubmissionId(submissionId);
  if (existing) throw new Error("Submission already has a dispatch record");

  const [dispatch] = await db
    .insert(dispatches)
    .values({
      submissionId,
      status: "dispatched",
      dispatchedBy: data.dispatchedBy,
      dispatchedAt: new Date(data.dispatchDate),
      notes: data.notes || null,
    })
    .returning();

  const email = findEmailFromResponses(submission.responses);
  if (email) {
    try {
      await sendMail({
        to: email,
        subject: "Your order has been dispatched",
        html: buildDispatchEmail(
          submission.submitter?.name || "Customer",
          data.dispatchedBy,
          data.dispatchDate,
        ),
      });
    } catch (e) {
      console.error("Failed to send dispatch email:", e);
    }
  }

  return dispatch;
};

export const markAsDelivered = async (
  submissionId: string,
  data: { deliveryDate: string },
) => {
  const dispatch = await getDispatchBySubmissionId(submissionId);
  if (!dispatch) throw new Error("No dispatch record found");
  if (dispatch.status === "delivered")
    throw new Error("Already delivered");

  const submission = await db.query.formSubmissions.findFirst({
    where: eq(formSubmissions.id, submissionId),
    with: {
      submitter: true,
      responses: {
        with: {
          field: true,
        },
      },
    },
  });

  const [updated] = await db
    .update(dispatches)
    .set({
      status: "delivered",
      deliveryDate: new Date(data.deliveryDate),
      deliveredAt: new Date(),
    })
    .where(eq(dispatches.submissionId, submissionId))
    .returning();

  const email = findEmailFromResponses(submission?.responses || []);
  if (email) {
    try {
      await sendMail({
        to: email,
        subject: "Your order has been delivered",
        html: buildDeliveryEmail(
          submission?.submitter?.name || "Customer",
          data.deliveryDate,
        ),
      });
    } catch (e) {
      console.error("Failed to send delivery email:", e);
    }
  }

  return updated;
};

function findEmailFromResponses(responses: any[]): string | null {
  for (const r of responses) {
    if (r.field?.type === "email" && r.value) return r.value;
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(r.value || ""))
      return r.value;
  }
  return null;
}

function buildDispatchEmail(name: string, dispatchedBy: string, dispatchDate: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#333">Your Order Has Been Dispatched</h2>
      <p>Hi ${name},</p>
      <p>Your order has been dispatched by <strong>${dispatchedBy}</strong> on <strong>${new Date(dispatchDate).toLocaleDateString()}</strong>.</p>
      <p>You will receive another notification once your order is delivered.</p>
      <p style="color:#888;font-size:12px">Powered by Sutit Forms</p>
    </div>`;
}

function buildDeliveryEmail(name: string, deliveryDate: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#333">Your Order Has Been Delivered</h2>
      <p>Hi ${name},</p>
      <p>Your order was delivered on <strong>${new Date(deliveryDate).toLocaleDateString()}</strong>.</p>
      <p>Thank you for your purchase!</p>
      <p style="color:#888;font-size:12px">Powered by Sutit Forms</p>
    </div>`;
}
