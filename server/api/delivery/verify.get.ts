import { getDispatchByToken } from "~~/server/services/dispatch.service";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const token = query.token as string;

  if (!token) {
    throw createError({ statusCode: 400, message: "Token is required" });
  }

  try {
    const dispatch = await getDispatchByToken(token);
    if (!dispatch) {
      throw createError({ statusCode: 404, message: "Invalid token" });
    }
    return { data: dispatch };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 400,
      message: e.message || "Failed to verify token",
    });
  }
});
