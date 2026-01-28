import {
  getSubmissionById,
  stopSubmissionTAT,
  updateSubmissionStatus,
} from "~~/server/services/submissions.service";
import { eq } from "drizzle-orm";
import { payments, formPayments } from "~~/server/db/schema";
import db from "~~/server/db";
import { randomBytes } from "crypto";

export default defineEventHandler(async (event) => {
  const { submissionId } = getRouterParams(event);
  const body = await readBody(event);
  const token = body.token as string;

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

  if (submission.status === "abandoned") {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot stop TAT for abandoned submission",
    });
  }

  // Check if user is authenticated via session
  let isAuthenticated = false;
  try {
    const { auth } = await import("~~/server/lib/auth");
    const session = await auth.api.getSession({
      headers: event.headers,
    });
    isAuthenticated = !!session?.user;
  } catch (error) {
    // Session check failed, continue with token validation
  }

  // If not authenticated, require token validation
  if (!isAuthenticated) {
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage:
          "Authentication required - please provide a token or login",
      });
    }

    // Validate token by checking if it matches the submission's access token
    if (submission.metadata?.accessToken !== token) {
      throw createError({
        statusCode: 403,
        statusMessage: "Invalid token - access denied",
      });
    }

    // Verify the token matches the phone number that paid
    const formPayment = await db.query.formPayments.findFirst({
      where: eq(formPayments.submissionId, submissionId),
      with: {
        payment: true,
      },
    });

    if (!formPayment?.payment) {
      throw createError({
        statusCode: 404,
        statusMessage: "Payment not found for this submission",
      });
    }

    // Additional validation: ensure token is generated for the paying phone number
    const storedTokenData = submission.metadata?.tokenData;
    if (
      !storedTokenData ||
      storedTokenData.phoneNumber !== formPayment.payment.phoneNumber
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "Token validation failed - phone number mismatch",
      });
    }
  }

  const updatedSubmission = await stopSubmissionTAT(submissionId);

  return {
    success: true,
    data: updatedSubmission,
  };
});
