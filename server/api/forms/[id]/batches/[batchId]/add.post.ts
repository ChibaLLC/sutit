import { auth } from "~~/server/lib/auth";
import { addToBatch } from "~~/server/services/dispatch.service";

export default defineEventHandler(async (event) => {
  const batchId = getRouterParam(event, "batchId");
  if (!batchId) throw createError({ statusCode: 400, message: "Batch ID required" });

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) throw createError({ statusCode: 401, message: "Unauthenticated" });

  const body = await readBody(event);
  if (!body?.submissionIds?.length) {
    throw createError({ statusCode: 400, message: "submissionIds are required" });
  }

  try {
    await addToBatch(batchId, body.submissionIds);
    return { success: true };
  } catch (e: any) {
    throw createError({ statusCode: 400, message: e.message });
  }
});
