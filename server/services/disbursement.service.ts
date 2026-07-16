import { and, eq, inArray } from "drizzle-orm";
import type { Form } from "~~/shared/types";

import db from "../db";
import { disbursements, forms, payments } from "../db/schema";
import { callB2b, callB2c } from "./mpesa.service";

type PaymentRow = typeof payments.$inferSelect;
type DisbursementRow = typeof disbursements.$inferSelect;

export type FormPayoutDetails = {
  payoutMethod: "phone" | "till" | "paybill" | null;
  payoutPhone?: string | null;
  payoutTill?: string | null;
  payoutPaybill?: string | null;
  payoutAccountNumber?: string | null;
};

/** Resolve destination + method from form payout settings */
export function resolvePayout(form: FormPayoutDetails): {
  method: "phone" | "till" | "paybill";
  destination: string;
  accountNumber?: string;
} | null {
  if (!form.payoutMethod) return null;

  if (form.payoutMethod === "phone" && form.payoutPhone) {
    return { method: "phone", destination: form.payoutPhone };
  }
  if (form.payoutMethod === "till" && form.payoutTill) {
    return { method: "till", destination: form.payoutTill };
  }
  if (form.payoutMethod === "paybill" && form.payoutPaybill) {
    return {
      method: "paybill",
      destination: form.payoutPaybill,
      accountNumber: form.payoutAccountNumber || undefined,
    };
  }
  return null;
}

/**
 * After a successful STK payment, send funds to the form owner's
 * configured payout destination (phone → B2C, till/paybill → B2B).
 */
export async function disburseToFormOwner(
  payment: PaymentRow,
  form: Form | (FormPayoutDetails & { id: string; title?: string | null }),
) {
  // Avoid double-payout for the same payment
  const existing = await db.query.disbursements.findFirst({
    where: and(
      eq(disbursements.paymentId, payment.id),
      inArray(disbursements.status, ["pending", "processing", "completed"]),
    ),
  });
  if (existing) {
    console.log("Disbursement already exists for payment", payment.id, existing.id);
    return existing;
  }

  const payout = resolvePayout(form as FormPayoutDetails);
  if (!payout) {
    console.warn(
      `Form ${form.id} has no valid payout details — skipping disbursement for payment ${payment.id}`,
    );
    return null;
  }

  const amount = payment.amount;
  if (!amount || amount <= 0) {
    console.warn("Payment amount is zero — skipping disbursement", payment.id);
    return null;
  }

  const [record] = await db
    .insert(disbursements)
    .values({
      paymentId: payment.id,
      formId: form.id,
      amount,
      method: payout.method,
      destination: payout.destination,
      accountNumber: payout.accountNumber,
      status: "pending",
      metadata: {
        formTitle: "title" in form ? form.title : undefined,
        receiptNumber: payment.receiptNumber,
      },
    })
    .returning();

  const reason = `Payout: ${("title" in form && form.title) || "form"}`.slice(0, 100);

  try {
    let result: {
      ConversationID: string;
      OriginatorConversationID: string;
      ResponseCode: string;
      ResponseDescription: string;
    } | null = null;

    if (payout.method === "phone") {
      let convId = record?.id ?? crypto.randomUUID();
      result = await callB2c({
        originatorConversationID: convId,
        phone_number: payout.destination,
        amount,
        reason,
        remarks: reason,
      });
    } else if (payout.method === "till") {
      result = await callB2b({
        till_number: payout.destination,
        amount,
        remarks: reason,
      });
    } else if (payout.method === "paybill") {
      result = await callB2b({
        paybill: {
          business_no: payout.destination,
          account_no: payout.accountNumber || payment.receiptNumber || form.id.slice(0, 12),
        },
        amount,
        remarks: reason,
      });
    }

    if (!result) {
      await db
        .update(disbursements)
        .set({
          status: "failed",
          resultDesc: "M-Pesa API request failed or was rejected",
          updatedAt: new Date(),
        })
        .where(eq(disbursements.id, record.id));
      return { ...record, status: "failed" as const };
    }

    const [updated] = await db
      .update(disbursements)
      .set({
        status: "processing",
        conversationId: result.ConversationID,
        originatorConversationId: result.OriginatorConversationID,
        resultDesc: result.ResponseDescription,
        updatedAt: new Date(),
      })
      .where(eq(disbursements.id, record.id))
      .returning();

    console.log(
      `Disbursement ${updated.id} processing via ${payout.method} → ${payout.destination} (KES ${amount})`,
    );
    return updated;
  } catch (e: any) {
    console.error("Disbursement error", e);
    await db
      .update(disbursements)
      .set({
        status: "failed",
        resultDesc: e?.message || "Unexpected disbursement error",
        updatedAt: new Date(),
      })
      .where(eq(disbursements.id, record.id));
    throw e;
  }
}

/** Handle B2C / B2B result callback from Safaricom */
export async function completeDisbursement(body: any) {
  const result = body?.Result ?? body;
  if (!result) {
    console.error("Invalid disbursement callback body", body);
    return null;
  }

  const conversationId: string | undefined = result.ConversationID;
  const originatorId: string | undefined = result.OriginatorConversationID;
  const resultCode = Number(result.ResultCode);
  const resultDesc: string = result.ResultDesc || "";

  let record: DisbursementRow | undefined;

  if (conversationId) {
    record = await db.query.disbursements.findFirst({
      where: eq(disbursements.conversationId, conversationId),
    });
  }
  if (!record && originatorId) {
    record = await db.query.disbursements.findFirst({
      where: eq(disbursements.originatorConversationId, originatorId),
    });
  }

  if (!record) {
    console.error("Disbursement not found for callback", { conversationId, originatorId });
    return null;
  }

  // Extract transaction receipt if present
  let transactionId: string | undefined;
  const params = result.ResultParameters?.ResultParameter;
  if (Array.isArray(params)) {
    for (const p of params) {
      if (p.Key === "TransactionReceipt" || p.Key === "TransactionID" || p.Key === "ReceiptNo") {
        transactionId = String(p.Value);
      }
    }
  }
  if (!transactionId && result.TransactionID) {
    transactionId = String(result.TransactionID);
  }

  const success = resultCode === 0;
  const [updated] = await db
    .update(disbursements)
    .set({
      status: success ? "completed" : "failed",
      resultCode,
      resultDesc,
      transactionId: transactionId || record.transactionId,
      metadata: {
        ...(typeof record.metadata === "object" && record.metadata ? record.metadata : {}),
        callback: result,
      },
      completedAt: success ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(disbursements.id, record.id))
    .returning();

  console.log(`Disbursement ${updated.id} ${success ? "completed" : "failed"}: ${resultDesc}`);
  return updated;
}

export async function getFormPayoutDetails(formId: string) {
  return db.query.forms.findFirst({
    where: eq(forms.id, formId),
    columns: {
      id: true,
      title: true,
      payoutMethod: true,
      payoutPhone: true,
      payoutTill: true,
      payoutPaybill: true,
      payoutAccountNumber: true,
    },
  });
}

/**
 * Retry a failed (or missing) disbursement for a completed payment.
 * Blocks if an active/completed disbursement already exists.
 */
export async function retryDisbursement(paymentId: string, formId: string) {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
  });
  if (!payment) {
    throw createDisbursementError(404, "Payment not found");
  }
  if (payment.status !== "completed") {
    throw createDisbursementError(400, "Can only disburse completed payments");
  }

  const active = await db.query.disbursements.findFirst({
    where: and(
      eq(disbursements.paymentId, paymentId),
      inArray(disbursements.status, ["pending", "processing", "completed"]),
    ),
  });
  if (active) {
    if (active.status === "completed") {
      throw createDisbursementError(400, "Disbursement already completed for this payment");
    }
    throw createDisbursementError(400, "A disbursement is already in progress for this payment");
  }

  const form = await getFormPayoutDetails(formId);
  if (!form) {
    throw createDisbursementError(404, "Form not found");
  }

  const payout = resolvePayout(form);
  if (!payout) {
    throw createDisbursementError(
      400,
      "Form has no valid payout details. Configure phone, till, or paybill in form settings.",
    );
  }

  return disburseToFormOwner(payment, form);
}

export async function getDisbursementsForPayment(paymentId: string) {
  return db.query.disbursements.findMany({
    where: eq(disbursements.paymentId, paymentId),
    orderBy: (d, { desc }) => [desc(d.createdAt)],
  });
}

function createDisbursementError(statusCode: number, message: string) {
  return createError({ statusCode, message, statusMessage: message });
}
