import { auth } from "~~/server/lib/auth";
import { retryDisbursement } from "~~/server/services/disbursement.service";
import { getFormById } from "~~/server/services/form.service";
import { getSubmissionById } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");
  const submissionId = getRouterParam(event, "submissionId");

  if (!formId || !submissionId) {
    throw createError({ statusCode: 400, message: "Form ID and submission ID are required" });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, message: "Unauthenticated" });
  }

  let form;
  try {
    form = await getFormById(formId);
  } catch {
    throw createError({ statusCode: 404, message: "Form not found" });
  }
  if (!form) {
    throw createError({ statusCode: 404, message: "Form not found" });
  }
  if (form.createdBy !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: "Only the form owner can retry disbursements",
    });
  }

  const submission = await getSubmissionById(submissionId);
  if (!submission || submission.formId !== form.id) {
    throw createError({ statusCode: 404, message: "Submission not found" });
  }

  const completedPayment =
    submission.payments?.find((fp) => fp.payment?.status === "completed")?.payment ?? null;

  if (!completedPayment) {
    throw createError({
      statusCode: 400,
      message: "No completed payment found for this submission",
    });
  }

  try {
    const disbursement = await retryDisbursement(completedPayment.id, form.id);
    return {
      success: true,
      data: disbursement,
      message:
        disbursement?.status === "processing"
          ? "Disbursement initiated successfully"
          : disbursement?.status === "failed"
            ? "Disbursement request failed. You can try again."
            : "Disbursement retry submitted",
    };
  } catch (e: any) {
    if (e?.statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: e?.message || "Failed to retry disbursement",
    });
  }
});
