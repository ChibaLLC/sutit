import { randomBytes, randomInt } from "crypto";

import { User } from "better-auth";
import { and, eq } from "drizzle-orm";
import { CreateGroupRequest } from "~~/shared/types";

import db from "../db";
import {
  formGroupMemberPayments,
  formGroupMembers,
  formGroups,
  forms,
  payments,
} from "../db/schema";
import { sendTextSmsTiara } from "../utils/sms/tiara";
import { sendMail } from "./email.service";
import { getFormById } from "./form.service";
import { callStkPush } from "./mpesa.service";
const generateInviteCode = () => randomBytes(10).toString("hex");

const generateInviteToken = () => randomBytes(32).toString("hex");

export const createGroup = async (formId: string, group: CreateGroupRequest, user: User) => {
  try {
    const form = await getFormById(formId);
    if (!form) {
      throw Error("Form Does not exist");
    }

    const existingGroup = await db.query.formGroups.findFirst({
      where: and(eq(formGroups.formId, form.id), eq(formGroups.groupName, group.groupName.trim())),
    });
    if (existingGroup) {
      console.log("GHroup Exists");
      throw Error("Group Already Exists Change Name");
    }
    return await db.transaction(async (tx) => {
      const inviteCode = generateInviteCode();
      const [formGroup] = await tx
        .insert(formGroups)
        .values({
          formId: form.id,
          groupName: group.groupName.trim(),
          leaderId: user.id,
          currentMemberCount: group.members.length,
          maxMembers: form?.groupMemberLimit,
          inviteCode,
          status: "published",
        })
        .returning();
      const memberRecords = [];
      for (const member of group.members) {
        const inviteToken = generateInviteToken();
        const [memberRecord] = await tx
          .insert(formGroupMembers)
          .values({
            groupId: formGroup.id,
            inviteEmail: member.email.toLowerCase().trim(),
            invitePhone: member.phone.trim(),
            inviteToken,
            isInviteAccepted: false,
            role: "member",
            metadata: {
              paymentOption: member.paymentOption,
              invitedBy: user.id,
            },
          })
          .returning();
        memberRecords.push(memberRecord);
      }
      let payment;
      const formPrice = parseInt(
        form.groupAmountPayable?.toString() || form.price?.toString() || "0",
      );
      if (formPrice > 0) {
        const leaderPayingMembers = group.members.filter((m) => m.paymentOption === "leader_pays");
        const leaderPaymentAmount = leaderPayingMembers.length * formPrice;
        payment = await processGroupPayment(
          {
            phone: group.phoneNumber,
            amount: leaderPaymentAmount,
            accountNumber: `group ${group.groupName}`,
            description: `Payment for group ${group.groupName}`,
          },
          user,
        );
        for (const member of memberRecords) {
          if (payment && member.metadata.paymentOption == "leader_pays") {
            await tx.insert(formGroupMemberPayments).values({
              groupId: formGroup?.id,
              memberId: member?.id,
              paymentId: payment.id,
              paidBy: user.id,
              amount: leaderPaymentAmount,
              paymentType: "leader_pays",
              metadata: payment?.metadata,
            });
          }
        }
      }

      if (!payment) {
        memberRecords.forEach(async (m) => {
          let url = process.env.NUXT_PUBLIC_URL;
          let link = `Here is the ${group.groupName.trim()} group invite link: ${url}/forms/${form.slug}?token=${m?.inviteToken}`;
          if (m?.inviteEmail) {
            await sendMail({
              to: m.inviteEmail,
              subject: "GROUP INVITE",
              text: link,
            });
          }
          if (m?.invitePhone) {
            await sendTextSmsTiara({
              phone: m.invitePhone,
              message: link,
            });
          }
        });
      } else {
        await db
          .update(formGroups)
          .set({ paymentId: payment.id })
          .where(eq(formGroups.id, formGroup.id));
      }

      return {
        payment: payment ?? null,
        group: formGroup,
        groupMembers: memberRecords,
      };
    });
  } catch (e: any) {
    throw new Error(e.message || "Failed to create group");
  }
};

export const getFormGroups = async (formId: string) => {
  return await db.query.forms.findFirst({
    where: eq(forms.id, formId),
    with: {
      groups: {
        with: {
          memberPayments: {
            with: {
              member: true,
              payment: true,
            },
          },
          payment: true,
          members: true,
        },
      },
    },
  });
};

export const getGroupById = async (groupId: string) => {
  const group = await db.query.formGroups.findFirst({
    where: eq(formGroups.id, groupId),
    with: {
      form: true,
      leader: true,
      members: true,
      memberPayments: {
        with: {
          payment: true,
        },
      },
      payment: true,
    },
  });

  if (!group) return null;

  const members = group.members.map((member) => {
    const memberPayment = group.memberPayments?.find((mp) => mp.memberId === member.id);
    const actualPayment = memberPayment?.payment;

    return {
      id: member.id,
      groupId: member.groupId,
      userId: member.userId,
      submissionId: member.submissionId,
      paymentId: member.paymentId,
      email: member.inviteEmail,
      phone: member.invitePhone,
      inviteAccepted: member.isInviteAccepted,
      role: member.role,
      joinedAt: member.joinedAt,
      metadata: member.metadata,
      paymentOption: member.metadata?.paymentOption || "self_pays",
      paymentStatus: actualPayment?.status || memberPayment?.status || "pending",
      paymentAmount: memberPayment?.amount || 0,
      hasSubmitted: !!member.submissionId,
    };
  });

  const stats = {
    totalMembers: members.length,
    formsSubmitted: members.filter((m) => m.hasSubmitted).length,
    paymentsCompleted: members.filter((m) => m.paymentStatus === "completed").length,
    invitesAccepted: members.filter((m) => m.inviteAccepted).length,
  };

  const totalAmount = members.reduce((sum, m) => {
    const price = parseInt(group.form?.price?.toString() || "0");
    return sum + (price || 0);
  }, 0);

  const leaderPaidAmount = members
    .filter((m) => m.paymentOption === "leader_pays")
    .reduce((sum, m) => sum + (group.form?.price ? parseInt(group.form.price.toString()) : 0), 0);

  const membersPaidAmount = members
    .filter((m) => m.paymentOption !== "leader_pays" && m.paymentStatus === "completed")
    .reduce((sum, m) => sum + m.paymentAmount, 0);

  return {
    ...group,
    members,
    stats,
    paymentSummary: {
      totalAmount,
      leaderPaidAmount,
      membersPaidAmount,
      pendingAmount: totalAmount - (leaderPaidAmount + membersPaidAmount),
    },
  };
};

export const resendMemberInvite = async (groupId: string, memberId: string) => {
  const group = await db.query.formGroups.findFirst({
    where: eq(formGroups.id, groupId),
    with: {
      form: true,
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  const member = await db.query.formGroupMembers.findFirst({
    where: eq(formGroupMembers.id, memberId),
  });

  if (!member) {
    throw new Error("Member not found");
  }

  if (member.isInviteAccepted) {
    throw new Error("Member has already accepted the invite");
  }

  const inviteLink = `${process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"}/forms/${group.form?.slug}/group/join?code=${group.inviteCode}&token=${member.inviteToken}`;

  if (member.inviteEmail) {
    await sendMail({
      to: member.inviteEmail,
      subject: "GROUP INVITE - Resent",
      text: `You have been invited to join the group "${group.groupName}". Here is your invite link: ${inviteLink}`,
    });
  }

  if (member.invitePhone) {
    await sendTextSmsTiara({
      phone: member.invitePhone,
      message: `You have been invited to join the group "${group.groupName}". Here is your invite link: ${inviteLink}`,
    });
  }

  return { success: true };
};

export const processGroupPayment = async (
  data: {
    phone: string;
    amount: number;
    description: string;
    accountNumber: string;
  },
  user: User,
) => {
  const result = await callStkPush(+data.phone, data.amount!, data.description, data.accountNumber);
  if (!result) {
    throw new Error("STK push failed. Please try again.");
  }
  const [payment] = await db
    .insert(payments)
    .values({
      userId: user.id,
      merchantId: result.MerchantRequestID,
      checkoutId: result.CheckoutRequestID,
      phoneNumber: data.phone,
      amount: data.amount,
    })
    .returning();
  return payment;
};

export const retryGroupPayment = async (group: any, user: User, phoneNumber?: string) => {
  const form = await getFormById(group.formId);
  if (!form) {
    throw new Error("Form not found");
  }

  const groupAmount = parseInt(
    form.groupAmountPayable?.toString() || form.price?.toString() || "0",
  );
  const totalAmount = group.currentMemberCount * groupAmount;

  const paymentPhone = phoneNumber || group.phoneNumber;

  if (!paymentPhone) {
    throw new Error("No payment phone number found");
  }

  const result = await callStkPush(
    +paymentPhone,
    totalAmount,
    `Payment for group ${group.groupName}`,
    `group ${group.groupName}`,
  );

  const [payment] = await db
    .insert(payments)
    .values({
      userId: user.id,
      merchantId: result.MerchantRequestID,
      checkoutId: result.CheckoutRequestID,
      phoneNumber: paymentPhone,
      amount: totalAmount,
    })
    .returning();

  const updateData: any = {
    paymentId: payment?.id,
  };

  if (phoneNumber && phoneNumber !== group.phoneNumber) {
    updateData.phoneNumber = phoneNumber;
  }

  await db.update(formGroups).set(updateData).where(eq(formGroups.id, group.id));

  return {
    payment: {
      checkoutId: result.CheckoutRequestID,
      merchantId: result.MerchantRequestID,
    },
    group,
  };
};
