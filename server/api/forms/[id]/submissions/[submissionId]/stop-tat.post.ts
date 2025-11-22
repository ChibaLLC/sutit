import { updateSubmissionStatus } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  const { id: formId, submissionId } = getRouterParams(event);

  if (!submissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid submission ID",
    });
  }

  // Update submission with completedAt
  await updateSubmissionStatus(submissionId, "completed");

  return { success: true };
});
