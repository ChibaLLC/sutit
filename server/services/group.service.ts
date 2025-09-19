import { randomBytes, randomInt } from "crypto";
import { getFormById } from "./form.service";
import db from "../db";
import {
	formGroupMemberPayments,
	formGroupMembers,
	formGroups,
	forms,
	payments,
} from "../db/schema";
import { and, eq } from "drizzle-orm";
import { CreateGroupRequest } from "~~/shared/types";
import { User } from "better-auth";
import { callStkPush } from "./mpesa.service";
import { sendMail } from "./email.service";
import { sendTextSmsTiara } from "../utils/sms/tiara";
const generateInviteCode = () => randomBytes(10).toString("hex");

const generateInviteToken = () => randomBytes(32).toString("hex");

export const createGroup = async (
	formId: string,
	group: CreateGroupRequest,
	user: User,
) => {
	try {
		const form = await getFormById(formId);
		if (!form) {
			throw Error("Form Does not exist");
		}

		const existingGroup = await db.query.formGroups.findFirst({
			where: and(
				eq(formGroups.formId, formId),
				eq(formGroups.groupName, group.groupName.trim()),
			),
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
			const leaderPayingMembers = group.members.filter(
				(m) => m.paymentOption === "leader_pays",
			);
			const leaderPaymentAmount =
				leaderPayingMembers.length *
				parseInt(form.groupAmountPayable || form.price || "0");
			let payment = await processGroupPayment(
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
						groupId: formGroup.id,
						memberId: member.id,
						paymentId: payment.id,
						paidBy: user.id,
						amount: leaderPaymentAmount,
						paymentType: "leader_pays",
						metadata: payment?.metadata,
					});
				}
			}
			memberRecords.forEach(async (m) => {
				let url = process.env.NUXT_PUBLIC_URL;
				let link = `Here is the group invite link: ${url}/forms/${form.slug}?token=${m.inviteToken}`;
				if (m.inviteEmail) {
					await sendMail({
						to: m.inviteEmail,
						subject: "GROUP INVITE",
						text: link,
					});
				} else if (m.invitePhone) {
					await sendTextSmsTiara({
						phone: m.invitePhone,
						message: link,
					});
				}
			});

			return {
				payment: payment,
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
	return await db.query.formGroups.findFirst({
		where: eq(formGroups.id, groupId),
		with: {
			form: true,
			leader: true,
			members: true,
			memberPayments: true,
			payment: true,
		},
	});
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
	try {
		let result = await callStkPush(
			+data.phone,
			data.amount!,
			data.description,
			data.accountNumber,
		);
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
	} catch (e: any) {
		console.log(e);
	}
};
