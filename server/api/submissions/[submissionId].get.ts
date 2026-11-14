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

  // This route is public: never expose the secrets that authorise access to the submission.
  const { accessToken: _accessToken, tokenData: _tokenData, checkin, ...metadata } =
    (submission.metadata as any) || {};
  const { code: _code, ...safeCheckin } = checkin || {};

  return {
    success: true,
    data: {
      ...submission,
      metadata: checkin ? { ...metadata, checkin: safeCheckin } : metadata,
    },
  };
});
