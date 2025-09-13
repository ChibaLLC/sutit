import { eq } from "drizzle-orm";
import db from "~~/server/db";
import { activities } from "~~/server/db/schema";
import { auth } from "~~/server/lib/auth";

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
  const allActivities = await db.query.activities.findMany({
    where: eq(activities.userId, session.user.id),
    limit: 10,
    orderBy: (activity, { desc }) => desc(activity.createdAt),
  });
  return {
    success: true,
    data: allActivities,
  };
});
