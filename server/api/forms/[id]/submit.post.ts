import { auth } from "~~/server/lib/auth";
import {
  submitForm,
  checkExistingSubmission,
  checkFailedPaymentSubmission,
} from "~~/server/services/submissions.service";
import { getFormById } from "~~/server/services/form.service";
import { retryFormPayment } from "~~/server/services/payment.service";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");

  if (!formId) {
    throw createError({ statusCode: 400, message: "Form ID is required" });
  }

  const form = await getFormById(formId);
  if (!form) {
    throw createError({ statusCode: 404, message: "Form not found" });
  }

  const session = await auth.api.getSession({ headers: event.headers });

  if (form.requiresLogin && !session?.user) {
    throw createError({
      statusCode: 401,
      message: "You must be logged in to submit this form",
    });
  }

  if (form.acceptResponses === false) {
    throw createError({
      statusCode: 400,
      message: "This form is not accepting responses right now",
    });
  }

  if (!form.allowMultipleSubmissions && session?.user) {
    const existing = await checkExistingSubmission(form.id, session.user.id);
    if (existing && existing.status === "completed") {
      throw createError({
        statusCode: 400,
        message: "You have already submitted this form",
      });
    }

    if (existing && (existing.status === "pending" || existing.status === "abandoned")) {
      const body = await readBody(event);
      try {
        const retryResult = await retryFormPayment(form, existing);

        return {
          data: {
            ...retryResult.payment,
            submissionId: existing.id,
          },
          message: "Payment retry initiated. Please complete on your phone.",
        };
      } catch (e: any) {
        console.error("Payment retry error:", e);
        throw createError({
          statusCode: 500,
          message: e.message || "Failed to retry payment. Please try again.",
        });
      }
    }
  }

  const body = await readBody(event);

  if (
    form.requireMerch &&
    (!body.selectedProducts || Object.keys(body.selectedProducts).length === 0)
  ) {
    throw createError({
      statusCode: 400,
      message: "This form requires you to select at least one product",
    });
  }

  try {
    const submission = await submitForm(formId, body, session?.user?.id);

    return {
      data: {
        ...submission.submmission,
        ...submission.pay,
        submissionId: submission.submmission.id,
      },
      message: submission.message,
    };
  } catch (e: any) {
    console.error("Form submission error:", e);
    throw createError({
      statusCode: 500,
      message: e.message || "Something went wrong. Please try again.",
    });
  }
});
