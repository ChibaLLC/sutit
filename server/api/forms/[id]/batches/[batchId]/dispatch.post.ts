import { auth } from "~~/server/lib/auth";
import { dispatchBatch } from "~~/server/services/dispatch.service";

export default defineEventHandler(async (event) => {
  const batchId = getRouterParam(event, "batchId");
  if (!batchId) throw createError({ statusCode: 400, message: "Batch ID required" });

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) throw createError({ statusCode: 401, message: "Unauthenticated" });

  const body = await readBody(event);
  if (!body?.dispatchedBy || !body?.dispatchDate) {
    throw createError({
      statusCode: 400,
      message: "dispatchedBy and dispatchDate are required",
    });
  }

  try {
    const batch = await dispatchBatch(batchId, body);
    return { data: batch, success: true };
  } catch (e: any) {
    throw createError({ statusCode: 400, message: e.message });
  }
});
