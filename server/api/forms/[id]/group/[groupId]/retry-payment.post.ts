import { auth } from "~~/server/lib/auth";
import { getGroupById } from "~~/server/services/group.service";
import { retryGroupPayment } from "~~/server/services/group.service";

export default defineEventHandler(async (event) => {
  const formId = getRouterParam(event, "id");
  const groupId = getRouterParam(event, "groupId");

  if (!formId || !groupId) {
    throw createError({ statusCode: 400, message: "Form ID and Group ID are required" });
  }

  const session = await auth.api.getSession({ headers: event.headers });
  if (!session?.user) {
    throw createError({ statusCode: 401, message: "You must be logged in" });
  }

  const group = await getGroupById(groupId);
  if (!group) {
    throw createError({ statusCode: 404, message: "Group not found" });
  }

  if (group.formId !== formId) {
    throw createError({ statusCode: 400, message: "Group does not belong to this form" });
  }

  if (group.leaderId !== session.user.id) {
    throw createError({ statusCode: 403, message: "Only the group leader can retry payment" });
  }

  try {
    const result = await retryGroupPayment(group, session.user);

    return {
      success: true,
      data: {
        payment: result.payment,
        group: result.group,
      },
      message: "Payment initiated. Please complete on your phone.",
    };
  } catch (e: any) {
    console.error("Group payment retry error:", e);
    throw createError({
      statusCode: 500,
      message: e.message || "Failed to initiate payment. Please try again.",
    });
  }
});