import { softDeleteSubmission } from "~~/server/services/submissions.service";

export default defineEventHandler(async (event) => {
  const submissionId = getRouterParam(event, "submissionId");

  if (!submissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Submission ID is required",
    });
  }

  try {
    await softDeleteSubmission(submissionId);

    return {
      success: true,
      message: "Submission deleted successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete submission",
    });
  }
});
