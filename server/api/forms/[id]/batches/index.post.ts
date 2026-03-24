import { auth } from "~~/server/lib/auth";
import { createBatch } from "~~/server/services/dispatch.service";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");
  if (!formId) throw createError({ statusCode: 400, message: "Form ID required" });

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) throw createError({ statusCode: 401, message: "Unauthenticated" });

  const body = await readBody(event);
  if (!body?.name || !body?.submissionIds?.length) {
    throw createError({
      statusCode: 400,
      message: "name and submissionIds are required",
    });
  }

  try {
    const batch = await createBatch(formId, body);
    return { data: batch, success: true };
  } catch (e: any) {
    throw createError({ statusCode: 400, message: e.message });
  }
});
