import {
  getSubmissionByCheckinCode,
  getSubmissionDisplayName,
} from "~~/server/services/submissions.service";

/** Public: participant's own check-in info, authorised by the code in their link. */
export default defineEventHandler(async (event) => {
  const submissionId = getRouterParam(event, "submissionId") || "";
  const code = getQuery(event).c as string | undefined;

  const submission = await getSubmissionByCheckinCode(submissionId, code);
  const checkin = (submission.metadata as any)?.checkin || {};

  return {
    success: true,
    data: {
      submissionId: submission.id,
      name: getSubmissionDisplayName(submission),
      eventTitle: submission.form?.title,
      paid: submission.status === "completed",
      checkedInAt: checkin.checkedInAt ?? null,
      distanceKm: checkin.distanceKm ?? null,
      distanceRecordedAt: checkin.distanceRecordedAt ?? null,
    },
  };
});
