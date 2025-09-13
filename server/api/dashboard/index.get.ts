import { auth } from "~~/server/lib/auth";
import { getUserDashboardStats } from "~~/server/services/dashboard.service";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });
  if (!session) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
  return await getUserDashboardStats(session.user.id);
});
