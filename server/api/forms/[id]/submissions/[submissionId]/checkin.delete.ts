import { undoCheckInSubmission } from "~~/server/services/submissions.service";
import { requireFormOwner } from "~~/server/utils/form-owner";

export default defineEventHandler(async (event) => {
  const { id: formId, submissionId } = getRouterParams(event);
  await requireFormOwner(event, formId);

  if (!submissionId) {
    throw createError({ statusCode: 400, statusMessage: "Submission ID required" });
  }

  const checkin = await undoCheckInSubmission(formId!, submissionId);
  return { success: true, checkin, message: "Check-in undone" };
});
