import { checkInSubmission } from "~~/server/services/submissions.service";
import { requireFormOwner } from "~~/server/utils/form-owner";

export default defineEventHandler(async (event) => {
  const { id: formId, submissionId } = getRouterParams(event);
  const { session } = await requireFormOwner(event, formId);

  if (!submissionId) {
    throw createError({ statusCode: 400, statusMessage: "Submission ID required" });
  }

  const result = await checkInSubmission(formId!, submissionId, session.user.id);

  return {
    success: true,
    alreadyCheckedIn: result.alreadyCheckedIn,
    checkin: result.checkin,
    message: result.alreadyCheckedIn ? "Already checked in" : "Checked in",
  };
});
