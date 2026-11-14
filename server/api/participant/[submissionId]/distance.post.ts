import {
  getSubmissionByCheckinCode,
  parseDistanceKm,
  recordSubmissionDistance,
} from "~~/server/services/submissions.service";

/** Public: participant submits their own distance, authorised by the code in their link. */
export default defineEventHandler(async (event) => {
  const submissionId = getRouterParam(event, "submissionId") || "";
  const body = await readBody(event);

  const submission = await getSubmissionByCheckinCode(submissionId, body?.code);
  const distanceKm = parseDistanceKm(body?.distanceKm);
  if (distanceKm === null) {
    throw createError({ statusCode: 400, statusMessage: "Please enter the distance you covered" });
  }

  const checkin = await recordSubmissionDistance(submission.formId, submission.id, distanceKm, {
    source: "participant",
  });

  return {
    success: true,
    data: { distanceKm: checkin.distanceKm, distanceRecordedAt: checkin.distanceRecordedAt },
    message: "Distance saved",
  };
});
