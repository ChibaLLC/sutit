import db from "../db";
import { dispatches, dispatchBatches, formSubmissions } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { sendMail } from "./email.service";
import { sendTextSmsTiara } from "~~/server/utils/sms/tiara";
import { randomBytes } from "crypto";

const generateToken = (): string => {
  return randomBytes(32).toString("hex");
};

export const getDispatchBySubmissionId = async (submissionId: string) => {
  return await db.query.dispatches.findFirst({
    where: eq(dispatches.submissionId, submissionId),
  });
};

export const getDispatchByToken = async (token: string) => {
  return await db.query.dispatches.findFirst({
    where: eq(dispatches.deliveryToken, token),
    with: {
      submission: {
        with: {
          form: true,
          submitter: true,
          storeResponses: {
            with: { item: true },
          },
        },
      },
    },
  });
};

export const createDispatch = async (
  submissionId: string,
  data: { dispatchedBy: string; dispatchDate: string; notes?: string },
) => {
  const submission = await db.query.formSubmissions.findFirst({
    where: and(eq(formSubmissions.id, submissionId), isNull(formSubmissions.deletedAt)),
    with: {
      storeResponses: true,
      submitter: true,
      responses: {
        with: { field: true },
      },
    },
  });

  if (!submission) throw new Error("Submission not found");
  if (!submission.storeResponses?.length) throw new Error("Submission has no products to dispatch");

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

  const phone = findPhoneFromResponses(submission.responses || []);
  if (phone) {
    try {
      await sendTextSmsTiara({
        phone,
        message: buildDispatchSms(
          submission.submitter?.name || "Customer",
          data.dispatchedBy,
          data.dispatchDate,
        ),
      });
    } catch (e) {
      console.error("Failed to send dispatch SMS:", e);
    }
  }

  return dispatch;
};

export const markAsDelivered = async (submissionId: string, data: { deliveryDate: string }) => {
  const dispatch = await getDispatchBySubmissionId(submissionId);
  if (!dispatch) throw new Error("No dispatch record found");
  if (dispatch.status === "delivered" && dispatch.deliveryConfirmedAt)
    throw new Error("Already delivered and confirmed");

  const submission = await db.query.formSubmissions.findFirst({
    where: eq(formSubmissions.id, submissionId),
    with: {
      submitter: true,
      responses: {
        with: { field: true },
      },
    },
  });

  const token = generateToken();
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const confirmUrl = `${baseUrl}/submission/${submissionId}/confirm-delivery?token=${token}`;

  const [updated] = await db
    .update(dispatches)
    .set({
      status: "delivered",
      deliveryDate: new Date(data.deliveryDate),
      deliveredAt: new Date(),
      deliveryToken: token,
    })
    .where(eq(dispatches.submissionId, submissionId))
    .returning();

  const email = findEmailFromResponses(submission?.responses || []);
  if (email) {
    try {
      await sendMail({
        to: email,
        subject: "Your order has been delivered - Confirm receipt",
        html: buildDeliveryEmail(
          submission?.submitter?.name || "Customer",
          data.deliveryDate,
          confirmUrl,
        ),
      });
    } catch (e) {
      console.error("Failed to send delivery email:", e);
    }
  }

  const phone = findPhoneFromResponses(submission?.responses || []);
  if (phone) {
    try {
      await sendTextSmsTiara({
        phone,
        message: buildDeliverySms(
          submission?.submitter?.name || "Customer",
          data.deliveryDate,
          confirmUrl,
        ),
      });
    } catch (e) {
      console.error("Failed to send delivery SMS:", e);
    }
  }

  return updated;
};

export const confirmDelivery = async (token: string) => {
  const dispatch = await db.query.dispatches.findFirst({
    where: eq(dispatches.deliveryToken, token),
  });

  if (!dispatch) throw new Error("Invalid verification token");
  if (dispatch.deliveryConfirmedAt) throw new Error("Delivery already confirmed");

  const [updated] = await db
    .update(dispatches)
    .set({ deliveryConfirmedAt: new Date() })
    .where(eq(dispatches.deliveryToken, token))
    .returning();

  return updated;
};

function findEmailFromResponses(responses: any[]): string | null {
  for (const r of responses) {
    if (r.field?.type === "email" && r.value) return r.value;
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(r.value || "")) return r.value;
  }
  return null;
}

function findPhoneFromResponses(responses: any[]): string | null {
  for (const r of responses) {
    if (!r.value) continue;
    const field = r.field;
    if (!field) continue;
    if (field.type === "phone") return r.value;
    const label = field.label?.toLowerCase() || "";
    if (label.includes("phone") || label.includes("mobile") || label.includes("cell")) {
      return r.value;
    }
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

function buildDeliveryEmail(name: string, deliveryDate: string, confirmUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#333">Your Order Has Been Delivered</h2>
      <p>Hi ${name},</p>
      <p>Your order was delivered on <strong>${new Date(deliveryDate).toLocaleDateString()}</strong>.</p>
      <p>Please confirm that you received your order by clicking the button below:</p>
      <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background:#22c55e;color:white;text-decoration:none;border-radius:6px;margin:16px 0">Confirm Receipt</a>
      <p style="color:#999;font-size:12px">Or copy this link: ${confirmUrl}</p>
      <p style="color:#888;font-size:12px">Powered by Sutit Forms</p>
    </div>`;
}

function buildDispatchSms(name: string, dispatchedBy: string, dispatchDate: string) {
  return `Hi ${name}, your order has been dispatched by ${dispatchedBy} on ${new Date(dispatchDate).toLocaleDateString()}. You'll be notified on delivery. - Sutit Forms`;
}

function buildDeliverySms(name: string, deliveryDate: string, confirmUrl: string) {
  return `Hi ${name}, your order was delivered on ${new Date(deliveryDate).toLocaleDateString()}. Confirm receipt: ${confirmUrl} - Sutit Forms`;
}

// ============================================
// BATCH DISPATCH
// ============================================

export const getBatchesByFormId = async (formId: string) => {
  return await db.query.dispatchBatches.findMany({
    where: eq(dispatchBatches.formId, formId),
    with: {
      dispatches: {
        with: {
          submission: {
            with: {
              submitter: true,
              storeResponses: {
                with: { item: true },
              },
            },
          },
        },
      },
    },
    orderBy: (batches, { desc }) => [desc(batches.createdAt)],
  });
};

export const getBatchById = async (batchId: string) => {
  return await db.query.dispatchBatches.findFirst({
    where: eq(dispatchBatches.id, batchId),
    with: {
      dispatches: {
        with: {
          submission: {
            with: {
              submitter: true,
              storeResponses: {
                with: { item: true },
              },
            },
          },
        },
      },
    },
  });
};

export const createBatch = async (
  formId: string,
  data: { name: string; submissionIds: string[]; notes?: string },
) => {
  return await db.transaction(async (tx) => {
    const [batch] = await tx
      .insert(dispatchBatches)
      .values({
        formId,
        name: data.name,
        notes: data.notes || null,
      })
      .returning();

    for (const submissionId of data.submissionIds) {
      const existing = await tx.query.dispatches.findFirst({
        where: eq(dispatches.submissionId, submissionId),
      });

      if (existing) {
        await tx
          .update(dispatches)
          .set({ batchId: batch.id })
          .where(eq(dispatches.submissionId, submissionId));
      } else {
        await tx.insert(dispatches).values({
          submissionId,
          batchId: batch.id,
          status: "pending",
        });
      }
    }

    return batch;
  });
};

export const dispatchBatch = async (
  batchId: string,
  data: { dispatchedBy: string; dispatchDate: string },
) => {
  return await db.transaction(async (tx) => {
    const batch = await tx.query.dispatchBatches.findFirst({
      where: eq(dispatchBatches.id, batchId),
      with: {
        dispatches: {
          with: {
            submission: {
              with: {
                submitter: true,
                responses: {
                  with: { field: true },
                },
              },
            },
          },
        },
      },
    });

    if (!batch) throw new Error("Batch not found");
    if (batch.status !== "open") throw new Error("Batch is not open");

    await tx
      .update(dispatchBatches)
      .set({
        status: "dispatched",
        dispatchedBy: data.dispatchedBy,
        dispatchedAt: new Date(data.dispatchDate),
      })
      .where(eq(dispatchBatches.id, batchId));

    for (const d of batch.dispatches) {
      await tx
        .update(dispatches)
        .set({
          status: "dispatched",
          dispatchedBy: data.dispatchedBy,
          dispatchedAt: new Date(data.dispatchDate),
        })
        .where(eq(dispatches.id, d.id));

    const email = findEmailFromResponses(d.submission?.responses || []);
    if (email) {
      try {
        await sendMail({
          to: email,
          subject: "Your order has been dispatched",
          html: buildDispatchEmail(
            d.submission?.submitter?.name || "Customer",
            data.dispatchedBy,
            data.dispatchDate,
          ),
        });
      } catch (e) {
        console.error("Failed to send dispatch email:", e);
      }
    }

    const phone = findPhoneFromResponses(d.submission?.responses || []);
    if (phone) {
      try {
        await sendTextSmsTiara({
          phone,
          message: buildDispatchSms(
            d.submission?.submitter?.name || "Customer",
            data.dispatchedBy,
            data.dispatchDate,
          ),
        });
      } catch (e) {
        console.error("Failed to send dispatch SMS:", e);
      }
    }
  }

    return batch;
  });
};

export const deliverBatch = async (batchId: string, data: { deliveryDate: string }) => {
  return await db.transaction(async (tx) => {
    const batch = await tx.query.dispatchBatches.findFirst({
      where: eq(dispatchBatches.id, batchId),
      with: {
        dispatches: {
          with: {
            submission: {
              with: {
                submitter: true,
                responses: {
                  with: { field: true },
                },
              },
            },
          },
        },
      },
    });

    if (!batch) throw new Error("Batch not found");

    await tx
      .update(dispatchBatches)
      .set({
        status: "delivered",
        deliveryDate: new Date(data.deliveryDate),
      })
      .where(eq(dispatchBatches.id, batchId));

    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

    for (const d of batch.dispatches) {
      const token = generateToken();
      const confirmUrl = `${baseUrl}/submission/${d.submissionId}/confirm-delivery?token=${token}`;

      await tx
        .update(dispatches)
        .set({
          status: "delivered",
          deliveryDate: new Date(data.deliveryDate),
          deliveredAt: new Date(),
          deliveryToken: token,
        })
        .where(eq(dispatches.id, d.id));

    const email = findEmailFromResponses(d.submission?.responses || []);
    if (email) {
      try {
        await sendMail({
          to: email,
          subject: "Your order has been delivered - Confirm receipt",
          html: buildDeliveryEmail(
            d.submission?.submitter?.name || "Customer",
            data.deliveryDate,
            confirmUrl,
          ),
        });
      } catch (e) {
        console.error("Failed to send delivery email:", e);
      }
    }

    const phone = findPhoneFromResponses(d.submission?.responses || []);
    if (phone) {
      try {
        await sendTextSmsTiara({
          phone,
          message: buildDeliverySms(
            d.submission?.submitter?.name || "Customer",
            data.deliveryDate,
            confirmUrl,
          ),
        });
      } catch (e) {
        console.error("Failed to send delivery SMS:", e);
      }
    }
  }

    return batch;
  });
};

export const addToBatch = async (batchId: string, submissionIds: string[]) => {
  return await db.transaction(async (tx) => {
    for (const submissionId of submissionIds) {
      const existing = await tx.query.dispatches.findFirst({
        where: eq(dispatches.submissionId, submissionId),
      });

      if (existing) {
        await tx
          .update(dispatches)
          .set({ batchId })
          .where(eq(dispatches.submissionId, submissionId));
      } else {
        await tx.insert(dispatches).values({
          submissionId,
          batchId,
          status: "pending",
        });
      }
    }
  });
};

export const removeFromBatch = async (submissionIds: string[]) => {
  for (const id of submissionIds) {
    await db
      .update(dispatches)
      .set({ batchId: null })
      .where(and(eq(dispatches.submissionId, id), eq(dispatches.status, "pending")));
  }
};
