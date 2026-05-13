import { auth } from "~~/server/lib/auth";
import { getUserGroups } from "~~/server/services/group.service";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  const groups = await getUserGroups(session.user.id);

  return {
    data: groups,
    success: true,
  };
});
