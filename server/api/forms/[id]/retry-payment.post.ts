import { auth } from "~~/server/lib/auth";
import { getFormById } from "~~/server/services/form.service";
import { retryFormPayment } from "~~/server/services/payment.service";
import { getSubmissionById } from "~~/server/services/submissions.service";

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
  const body = await readBody(event);
  const { submissionId } = body;

  if (!submissionId) {
    throw createError({ statusCode: 400, message: "Submission ID is required" });
  }

  const submission = await getSubmissionById(submissionId);
  if (!submission) {
    throw createError({ statusCode: 404, message: "Submission not found" });
  }

  if (submission.formId !== formId) {
    throw createError({ statusCode: 400, message: "Submission does not belong to this form" });
  }

  if (submission.status !== "pending" && submission.status !== "abandoned") {
    throw createError({
      statusCode: 400,
      message: "Submission cannot retry payment in current state",
    });
  }

  if (session?.user && submission.submitterId !== session.user.id) {
    throw createError({ statusCode: 403, message: "You can only retry your own payments" });
  }

  try {
    const result = await retryFormPayment(form, submission);

    return {
      data: {
        ...result,
        submissionId: submission.id,
      },
      message: "Payment initiated. Please complete on your phone.",
    };
  } catch (e: any) {
    console.error("Payment retry error:", e);
    throw createError({
      statusCode: 500,
      message: e.message || "Failed to initiate payment. Please try again.",
    });
  }
});
