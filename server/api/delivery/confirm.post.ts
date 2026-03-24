import { confirmDelivery } from "~~/server/services/dispatch.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body?.token) {
    throw createError({ statusCode: 400, message: "Token is required" });
  }

  try {
    const dispatch = await confirmDelivery(body.token);
    return { success: true, message: "Delivery confirmed successfully" };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      message: e.message || "Failed to confirm delivery",
    });
  }
});
