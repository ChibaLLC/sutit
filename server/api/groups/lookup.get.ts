import { eq } from "drizzle-orm";
import db from "~~/server/db";
import { formGroups } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    throw createError({ statusCode: 400, message: "Invite code is required" });
  }

  const group = await db.query.formGroups.findFirst({
    where: eq(formGroups.inviteCode, code),
    with: {
      form: true,
      leader: true,
      members: true,
    },
  });

  if (!group) {
    throw createError({ statusCode: 404, message: "Group not found" });
  }

  const inviteLink = `${process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"}/forms/${group.form?.slug}/group/join?code=${group.inviteCode}`;

  return {
    data: {
      ...group,
      inviteLink,
    },
    success: true,
  };
});
