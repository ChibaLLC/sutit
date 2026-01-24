import { getSubmissionById } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  const { submissionId } = getRouterParams(event);

  if (!submissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid submission ID",
    });
  }

  const submission = await getSubmissionById(submissionId);

  if (!submission) {
    throw createError({
      statusCode: 404,
      statusMessage: "Submission not found",
    });
  }

  return {
    success: true,
    data: submission,
  };
});