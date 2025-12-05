import { Mpesa } from "daraja.js";
import { Form, StkCallbackHook, Submission } from "~~/shared/types";
import { formGroupMemberPayments, formPayments, payments } from "../db/schema";
import db from "../db";
import { eq } from "drizzle-orm";
import { callStkPush } from "./mpesa.service";
import { sendMail } from "./email.service";
import { type PgTransaction } from "drizzle-orm/pg-core";
import { permanentDeleteSubmission } from "./submissions.service";
const createPayment = async (
  tx: PgTransaction<any, any, any>,
  form: Form,
  submission: Submission,
  mpesa: { checkoutId: string; merchantId: string; phone: string },
) => {
  const [payment] = await tx
    .insert(payments)
    .values({
      userId: submission.submitterId,
      merchantId: mpesa.merchantId,
      checkoutId: mpesa.checkoutId,
      phoneNumber: mpesa.phone,
      amount: submission.pricePaid,
    })
    .returning();
  const [formPayment] = await tx
    .insert(formPayments)
    .values({
      formId: form.id,
      paymentId: payment.id,
      submissionId: submission.id,
    })
    .returning();
  console.log(payment, formPayment);
  return {
    payment: payment,
    formPayment: formPayment,
  };
};

export const processFormPayment = async (
  tx: PgTransaction<any, any, any>,
  form: Form,
  submission: Submission,
) => {
  if (submission.metadata && submission.metadata.paymentData.phoneNumber) {
    let paymentData = {
      phone: submission.metadata.paymentData.phoneNumber,
      amount: submission.pricePaid,
      accountNumber: form.title,
      description: `Payment for ${form.title} `,
    };
    let result = await callStkPush(
      +paymentData.phone,
      paymentData.amount!,
      paymentData.description,
      paymentData.accountNumber,
    );
    if (!result) {
      throw new Error("Stk push failed");
    }
    return await createPayment(tx, form, submission, {
      checkoutId: result.CheckoutRequestID,
      merchantId: result.MerchantRequestID,
      phone: paymentData.phone,
    });
  }
};

export const completeFormPayment = async (data: StkCallbackHook) => {
  const { stkCallback } = data.Body;

  if (stkCallback.ResultCode != 0) {
    const [payment] = await db
      .update(payments)
      .set({
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(payments.checkoutId, stkCallback.CheckoutRequestID))
      .returning();

    let formPayment = await db.query.formPayments.findFirst({
      where: eq(formPayments.paymentId, payment.id),
    });

    if (formPayment?.submissionId) {
      await permanentDeleteSubmission(formPayment?.submissionId);
    }

    return { success: false, message: stkCallback.ResultDesc };
  }

  const meta: Record<string, string | number> = {};
  let receiptNumber: string | undefined;
  let amount: number | undefined;

  if (stkCallback.CallbackMetadata?.Item) {
    for (const item of stkCallback.CallbackMetadata.Item) {
      meta[item.Name] = item.Value;
      if (
        item.Name === "MpesaReceiptNumber" &&
        typeof item.Value === "string"
      ) {
        receiptNumber = item.Value;
      }
      if (item.Name === "Amount" && typeof item.Value === "number") {
        amount = item.Value;
      }
    }
  }

  // Update the payment row
  const [updatedPayment] = await db
    .update(payments)
    .set({
      status: "completed",
      receiptNumber,
      paidAt: new Date(),
      metadata: meta,
      updatedAt: new Date(),
    })
    .where(eq(payments.checkoutId, stkCallback.CheckoutRequestID))
    .returning();
  if (updatedPayment) {
    await db
      .update(formGroupMemberPayments)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(formGroupMemberPayments.paymentId, updatedPayment.id));
  }
  const formPayment = await db.query.formPayments.findFirst({
    where: eq(formPayments.paymentId, updatedPayment.id),
    with: {
      form: true,
      submission: {
        with: {
          submitter: true,
        },
      },
    },
  });

  await sendTextSmsTiara({
    phone: updatedPayment.phoneNumber,
    message: `[SUTIT] KSH ${updatedPayment.amount} received for ${formPayment?.form.title}. Receipt Number ${receiptNumber ?? updatedPayment.referenceCode}`,
  });
  if (formPayment?.form.afterSubmissionMessage) {
    await sendTextSmsTiara({
      phone: updatedPayment.phoneNumber,
      message: formPayment?.form.afterSubmissionMessage,
    });
    if (formPayment?.submission.submitter) {
      await sendMail({
        to: formPayment.submission.submitter.email,
        text: formPayment.form.afterSubmissionMessage,
        subject: "After Submission",
      });
    }
  }

  return updatedPayment;
};

export const findPaymentWithCheckoutId = async (data: {
  checkoutId: string;
}) => {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.checkoutId, data.checkoutId),
  });
  if (!payment) {
    throw Error("Payment Not Found");
  }
  return payment;
};
