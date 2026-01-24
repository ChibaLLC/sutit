import { auth } from "~~/server/lib/auth";
import { updateSubmissionStatus, getSubmissionById } from "~~/server/services/submissions.service";
import { formSubmissions, forms } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import db from "~~/server/db";

export default defineEventHandler(async (event) => {
  const { id: formId, submissionId } = getRouterParams(event);

  if (!submissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid submission ID",
    });
  }

  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Authentication required",
    });
  }

  const submission = await getSubmissionById(submissionId);
  if (!submission) {
    throw createError({
      statusCode: 404,
      statusMessage: "Submission not found",
    });
  }

  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  });

  if (!form) {
    throw createError({
      statusCode: 404,
      statusMessage: "Form not found",
    });
  }

  if (form.createdBy !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden - Only form owner can stop TAT",
    });
  }

  await updateSubmissionStatus(submissionId, "completed");

  return { success: true };
});
