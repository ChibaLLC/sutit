import { auth } from "~~/server/lib/auth";
import { getGroupById } from "~~/server/services/group.service";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  if (!params.id && !params.groupId) {
    throw createError({
      statusCode: 404,
      message: "Form ID and Group ID are required",
    });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  const group = await getGroupById(params.groupId);

  if (!group) {
    throw createError({
      statusCode: 404,
      message: "Not Found",
    });
  }

  const isLeader = session?.user?.id === group.leaderId;
  const inviteLink = `${process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"}/forms/${group.form?.slug}/group/join?code=${group.inviteCode}`;

  return {
    data: {
      ...group,
      userRole: isLeader ? "leader" : "member",
      inviteLink,
    },
    success: true,
  };
});
