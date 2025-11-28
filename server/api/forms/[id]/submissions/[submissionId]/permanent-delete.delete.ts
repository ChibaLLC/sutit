import { permanentDeleteSubmission } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  const submissionId = getRouterParam(event, "submissionId");

  if (!submissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Submission ID is required",
    });
  }

  try {
    await permanentDeleteSubmission(submissionId);

    return {
      success: true,
      message: "Submission permanently deleted",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to permanently delete submission",
    });
  }
});
