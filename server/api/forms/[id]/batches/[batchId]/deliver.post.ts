import { auth } from "~~/server/lib/auth";
import { deliverBatch } from "~~/server/services/dispatch.service";

export default defineEventHandler(async (event) => {
  const batchId = getRouterParam(event, "batchId");
  if (!batchId) throw createError({ statusCode: 400, message: "Batch ID required" });

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) throw createError({ statusCode: 401, message: "Unauthenticated" });

  const body = await readBody(event);
  if (!body?.deliveryDate) {
    throw createError({ statusCode: 400, message: "deliveryDate is required" });
  }

  try {
    const batch = await deliverBatch(batchId, body);
    return { data: batch, success: true };
  } catch (e: any) {
    throw createError({ statusCode: 400, message: e.message });
  }
});
