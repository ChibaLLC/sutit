import { getSubmissionById } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  const { id: formId, id: submissionId } = getRouterParams(event);

  if (!submissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid submission ID",
    });
  }

  const submission = await getSubmissionById(submissionId);

  if (!submission || submission.formId !== formId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Submission not found",
    });
  }

  // Set headers for download
  setHeader(event, "Content-Type", "application/json");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="submission-${submission.id}.json"`,
  );

  return submission;
});
