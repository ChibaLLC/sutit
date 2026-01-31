import { auth } from "~~/server/lib/auth";
import { processFormPayment } from "~~/server/services/payment.service";
import { submitForm, checkExistingSubmission } from "~~/server/services/submissions.service";
import { getFormById } from "~~/server/services/form.service";

export default defineEventHandler(async (event) => {
  try {
    const formId = getRouterParam(event, "id");
    if (!formId) {
      throw createError({
        message: "Form ID is required",
        statusCode: 404,
      });
    }

    // Get form settings first to validate
    const form = await getFormById(formId);
    
    if (!form) {
      throw createError({
        message: "Form not found",
        statusCode: 404,
      });
    }

    // Get user session
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    // Check if form requires login
    if (form.requiresLogin && !session?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
        data: {
          type: "authentication_required",
          message: "This form requires you to be logged in to submit",
          requiresLogin: true,
        },
      });
    }

    // Check if form is public
    if (!form.isPublic && !session?.user) {
      throw createError({
        statusCode: 403,
        statusMessage: "Form not public",
        data: {
          type: "form_not_public",
          message: "This form is not publicly accessible",
        },
      });
    }

    // Check submission limit
    if (form.submissionLimit && form.submissionLimit > 0) {
      const submissionCount = await getSubmissionCount(formId);
      if (submissionCount >= form.submissionLimit) {
        throw createError({
          statusCode: 400,
          statusMessage: "Submission limit reached",
          data: {
            type: "submission_limit_reached",
            message: `This form has reached its maximum limit of ${form.submissionLimit} submissions`,
            limit: form.submissionLimit,
            current: submissionCount,
          },
        });
      }
    }

    // Check multiple submissions for logged in users
    if (!form.allowMultipleSubmissions && session?.user) {
      const existingSubmission = await checkExistingSubmission(formId, session.user.id);
      if (existingSubmission) {
        throw createError({
          statusCode: 400,
          statusMessage: "Submission already exists",
          data: {
            type: "submission_exists",
            message: "You have already submitted this form",
            existingSubmissionId: existingSubmission.id,
          },
        });
      }
    }

    // Check if form accepts responses
    if (form.acceptResponses === false) {
      throw createError({
        statusCode: 400,
        statusMessage: "Form not accepting responses",
        data: {
          type: "form_closed",
          message: "This form is not currently accepting responses",
        },
      });
    }

    const body = await readBody(event);
    
    // Validate required merchandise
    if (form.requireMerch) {
      const hasStoreItems = body.selectedProducts && Object.keys(body.selectedProducts).length > 0;
      if (!hasStoreItems) {
        throw createError({
          statusCode: 400,
          statusMessage: "Merchandise required",
          data: {
            type: "merchandise_required",
            message: "This form requires you to purchase merchandise",
          },
        });
      }
    }

    let submission = await submitForm(formId, body, session?.user?.id);
    
    return {
      data: {
        ...submission.submmission,
        ...submission.pay,
        submissionId: submission.submmission.id,
      },
      message: submission.message,
    };
  } catch (e: any) {
    // If it's already a formatted error, re-throw it
    if (e.statusCode && e.data) {
      throw e;
    }
    
    console.error("Form submission error:", e);
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred during submission",
      data: e.data || {
        type: "server_error",
        message: e.message || "An unexpected error occurred",
      },
    });
  }
});

// Helper function to get submission count
async function getSubmissionCount(formId: string): Promise<number> {
  const db = (await import("~~/server/db")).default;
  const { formSubmissions, eq, isNull, sql } = await import("~~/server/db/schema");
  
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(formSubmissions)
    .where(eq(formSubmissions.formId, formId))
    .execute();
  
  return result[0]?.count || 0;
}
