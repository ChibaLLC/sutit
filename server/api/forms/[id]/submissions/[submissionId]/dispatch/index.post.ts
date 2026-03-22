import { auth } from "~~/server/lib/auth";
import { createDispatch } from "~~/server/services/dispatch.service";

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
  if (!body?.dispatchedBy || !body?.dispatchDate) {
    throw createError({
      statusCode: 400,
      message: "dispatchedBy and dispatchDate are required",
    });
  }

  try {
    const dispatch = await createDispatch(submissionId, body);
    return { data: dispatch, success: true };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      message: e.message || "Failed to dispatch",
    });
  }
});
