import { auth } from "~~/server/lib/auth";
import { markAsDelivered, getDispatchBySubmissionId } from "~~/server/services/dispatch.service";

export default defineEventHandler(async (event) => {
  const submissionId = getRouterParam(event, "submissionId");
  if (!submissionId) {
    throw createError({ statusCode: 400, message: "Submission ID required" });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({ statusCode: 401, message: "Unauthenticated" });
  }

  const body = await readBody(event);
  if (!body?.deliveryDate) {
    throw createError({
      statusCode: 400,
      message: "deliveryDate is required",
    });
  }

  try {
    const dispatch = await markAsDelivered(submissionId, body);
    return { data: dispatch, success: true };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      message: e.message || "Failed to mark as delivered",
    });
  }
});
