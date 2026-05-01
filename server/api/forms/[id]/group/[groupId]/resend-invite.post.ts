import { auth } from "~~/server/lib/auth";
import { getGroupById, resendMemberInvite } from "~~/server/services/group.service";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const body = await readBody(event);

  if (!params.id || !params.groupId) {
    throw createError({
      statusCode: 400,
      message: "Form ID and Group ID are required",
    });
  }

  if (!body.memberId) {
    throw createError({
      statusCode: 400,
      message: "Member ID is required",
    });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session) {
    throw createError({
      statusCode: 401,
      message: "Authentication required",
    });
  }

  const group = await getGroupById(params.groupId);
  if (!group) {
    throw createError({
      statusCode: 404,
      message: "Group not found",
    });
  }

  if (group.leaderId !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: "Only group leader can resend invites",
    });
  }

  try {
    await resendMemberInvite(params.groupId, body.memberId);
    return { success: true, message: "Invite resent successfully" };
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      message: e.message || "Failed to resend invite",
    });
  }
});
