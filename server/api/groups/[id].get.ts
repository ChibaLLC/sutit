import { auth } from "~~/server/lib/auth";
import { getGroupById } from "~~/server/services/group.service";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  if (!params.id) {
    throw createError({
      statusCode: 404,
      message: "Group ID is required",
    });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  const group = await getGroupById(params.id);

  if (!group) {
    throw createError({
      statusCode: 404,
      message: "Group not found",
    });
  }

  const isLeader = session?.user?.id === group.leaderId;
  const inviteLink = `${process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"}/forms/${group.form?.slug}/group/join?code=${group.inviteCode}`;

  return {
    data: {
      ...group,
      formId: group.formId,
      userRole: isLeader ? "leader" : "member",
      inviteLink,
    },
    success: true,
  };
});