import { parseDistanceKm, recordSubmissionDistance } from "~~/server/services/submissions.service";
import { requireFormOwner } from "~~/server/utils/form-owner";

export default defineEventHandler(async (event) => {
  const { id: formId, submissionId } = getRouterParams(event);
  const { session } = await requireFormOwner(event, formId);

  if (!submissionId) {
    throw createError({ statusCode: 400, statusMessage: "Submission ID required" });
  }

  const body = await readBody(event);
  const distanceKm = parseDistanceKm(body?.distanceKm);

  const checkin = await recordSubmissionDistance(formId!, submissionId, distanceKm, {
    source: "organizer",
    userId: session.user.id,
  });
  return { success: true, checkin, message: "Distance saved" };
});
