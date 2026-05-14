import { randomBytes } from "crypto";

import { and, eq } from "drizzle-orm";
import db from "~~/server/db";
import { formGroupMembers, formGroups } from "~~/server/db/schema";
import { auth } from "~~/server/lib/auth";
import { sendMail } from "~~/server/services/email.service";

const generateInviteToken = () => randomBytes(32).toString("hex");

export default defineEventHandler(async (event) => {
  try {
    const session = await auth.api.getSession({ headers: event.headers });
    const { code, token, email, phone } = await readBody(event);

    let member;
    let group;

    if (token) {
      // Token-based accept - member was invited by leader
      member = await db.query.formGroupMembers.findFirst({
        where: eq(formGroupMembers.inviteToken, token),
        with: { group: { with: { form: true, leader: true } } },
      });

      if (!member) {
        throw createError({ statusCode: 404, message: "Invite not found" });
      }
      if (member.isInviteAccepted) {
        throw createError({ statusCode: 400, message: "Invite already accepted" });
      }

      group = member.group;

      const updateData: Record<string, any> = {
        isInviteAccepted: true,
        joinedAt: new Date(),
      };
      if (email) updateData.inviteEmail = email.toLowerCase().trim();
      if (phone) updateData.invitePhone = phone.trim();
      if (session?.user) updateData.userId = session.user.id;

      await db
        .update(formGroupMembers)
        .set(updateData)
        .where(and(eq(formGroupMembers.id, member.id), eq(formGroupMembers.inviteToken, token)));
    } else if (code) {
      // Self-join with invite code (no prior token)
      group = await db.query.formGroups.findFirst({
        where: eq(formGroups.inviteCode, code),
        with: { form: true, leader: true },
      });

      if (!group) {
        throw createError({ statusCode: 404, message: "Group not found" });
      }

      if (!email) {
        throw createError({ statusCode: 400, message: "Email is required to join" });
      }

      // Check if member already exists by email
      member = await db.query.formGroupMembers.findFirst({
        where: and(
          eq(formGroupMembers.groupId, group.id),
          eq(formGroupMembers.inviteEmail, email.toLowerCase().trim()),
        ),
      });

      if (member) {
        if (member.isInviteAccepted) {
          throw createError({ statusCode: 400, message: "Already a member of this group" });
        }

        await db
          .update(formGroupMembers)
          .set({
            isInviteAccepted: true,
            joinedAt: new Date(),
            invitePhone: phone?.trim() || member.invitePhone,
            metadata: { ...member.metadata, paymentOption: "member_pays" },
          })
          .where(eq(formGroupMembers.id, member.id));
      } else {
        const inviteToken = generateInviteToken();
        const [newMember] = await db
          .insert(formGroupMembers)
          .values({
            groupId: group.id,
            inviteEmail: email.toLowerCase().trim(),
            invitePhone: phone?.trim(),
            inviteToken,
            isInviteAccepted: true,
            joinedAt: new Date(),
            role: "member",
            metadata: { paymentOption: "member_pays", joinedVia: "self" },
          })
          .returning();
        member = newMember;

        await db
          .update(formGroups)
          .set({ currentMemberCount: (group.currentMemberCount || 0) + 1 })
          .where(eq(formGroups.id, group.id));
      }
    } else {
      throw createError({ statusCode: 400, message: "Invite token or group code is required" });
    }

    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const formLink = `${siteUrl}/forms/${group.form?.slug}?token=${member.inviteToken}`;

    if (member.inviteEmail) {
      try {
        await sendMail({
          to: member.inviteEmail,
          subject: `You've joined "${group.groupName}"`,
          text: `You have successfully joined "${group.groupName}". Access the form here: ${formLink}`,
        });
      } catch (e) {
        console.error("Failed to send join email", e);
      }
    }

    return {
      success: true,
      data: {
        id: member.id,
        groupId: member.groupId,
        inviteEmail: member.inviteEmail,
        invitePhone: member.invitePhone,
        inviteToken: member.inviteToken,
        isInviteAccepted: member.isInviteAccepted,
        role: member.role,
        joinedAt: member.joinedAt,
        metadata: member.metadata,
        formLink,
      },
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "Failed to accept invite",
    });
  }
});
