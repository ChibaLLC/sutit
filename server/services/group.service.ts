import crypto from "crypto"; // For generating secure invite tokens
import { eq, and, InferInsertModel, sql } from "drizzle-orm";
import {
	activities,
	formGroupMembers,
	formGroups,
	forms,
	formStatusEnum,
} from "../db/schema";
import db from "../db";

// --- Type Definitions ---
export type NewFormGroup = InferInsertModel<typeof formGroups>;
export type NewFormGroupMember = InferInsertModel<typeof formGroupMembers>;

export interface CreateGroupPayload {
	formId: string;
	groupName: string;
	leaderId: string; // The user creating the group
	maxMembers?: number; // Optional, overrides form setting
	status?: (typeof formStatusEnum.enumValues)[number];
	metadata?: object;
}

export interface InviteMemberPayload {
	groupId: string;
	inviterId: string; // The user sending the invite
	email?: string;
	phone?: string;
	userId?: string; // If inviting an existing user directly
	role?: string; // e.g., 'member'
}

export interface AcceptInvitePayload {
	inviteToken: string;
	userId: string; // The user accepting the invite
}

export interface GroupPaymentDetails {
	groupId: string;
	payerId: string; // User making the payment
	amount: number; // Amount being paid (in cents)
	referenceCode: string;
	phoneNumber: string;
	metadata?: object;
	// ... potentially other payment-specific fields
}

// --- Group Creation Service ---
export async function createFormGroup(payload: CreateGroupPayload) {
	return db.transaction(async (tx) => {
		const form = await tx.query.forms.findFirst({
			where: eq(forms.id, payload.formId),
			columns: { groupMemberLimit: true, allowGroups: true },
		});

		if (!form || !form.allowGroups) {
			tx.rollback();
			throw new Error("Form does not allow group registrations.");
		}

		const inviteCode = crypto.randomBytes(8).toString("hex"); // Generate a unique invite code

		const [newGroup] = await tx
			.insert(formGroups)
			.values({
				createdAt: new Date(),
				updatedAt: new Date(),
				currentMemberCount: 1, // Leader is the first member
				maxMembers: payload.maxMembers || form.groupMemberLimit,
				inviteCode: inviteCode,
				status: payload.status || "draft",
				...payload,
			})
			.returning();

		if (!newGroup) {
			tx.rollback();
			throw new Error("Failed to create form group.");
		}

		// Add the leader as the first member of the group
		await tx.insert(formGroupMembers).values({
			groupId: newGroup.id,
			userId: payload.leaderId,
			role: "leader",
			isInviteAccepted: true,
			joinedAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await tx.insert(activities).values({
			userId: payload.leaderId,
			formId: payload.formId, // Link activity to the form as well
			type: "group_created",
			description: `Group '${newGroup.groupName}' created for form '${payload.formId}'.`,
			resourceType: "form_group",
			resourceId: newGroup.id,
			createdAt: new Date(),
			metadata: { groupName: newGroup.groupName, formId: newGroup.formId },
		});

		return newGroup;
	});
}

// --- Group Member Invitation Service ---
export async function inviteMemberToGroup(payload: InviteMemberPayload) {
	return db.transaction(async (tx) => {
		const group = await tx.query.formGroups.findFirst({
			where: eq(formGroups.id, payload.groupId),
		});
		if (!group) {
			tx.rollback();
			throw new Error("Group not found.");
		}
		if (group.currentMemberCount >= (group.maxMembers || Infinity)) {
			tx.rollback();
			throw new Error("Group has reached its maximum member limit.");
		}

		const inviteToken = crypto.randomBytes(16).toString("hex"); // Secure token for invite link

		// Check for existing invite/member
		let existingMemberQuery = tx
			.select()
			.from(formGroupMembers)
			.where(eq(formGroupMembers.groupId, payload.groupId));
		if (payload.userId) {
			existingMemberQuery = existingMemberQuery.where(
				eq(formGroupMembers.userId, payload.userId),
			);
		} else if (payload.email) {
			existingMemberQuery = existingMemberQuery.where(
				eq(formGroupMembers.inviteEmail, payload.email),
			);
		} else if (payload.phone) {
			existingMemberQuery = existingMemberQuery.where(
				eq(formGroupMembers.invitePhone, payload.phone),
			);
		}

		const existingMember = await existingMemberQuery;
		if (existingMember.length > 0) {
			tx.rollback();
			throw new Error("User or invite already exists for this group.");
		}

		const [newMember] = await tx
			.insert(formGroupMembers)
			.values({
				groupId: payload.groupId,
				userId: payload.userId || null,
				inviteEmail: payload.email || null,
				invitePhone: payload.phone || null,
				inviteToken: inviteToken,
				isInviteAccepted: false,
				role: payload.role || "member",
				invitedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newMember) {
			tx.rollback();
			throw new Error("Failed to invite member to group.");
		}

		await tx.insert(activities).values({
			userId: payload.inviterId,
			formId: group.formId,
			type: "group_invite_sent",
			description: `Invite sent to ${payload.email || payload.phone || payload.userId} for group '${group.groupName}'.`,
			resourceType: "form_group_member",
			resourceId: newMember.id,
			createdAt: new Date(),
			metadata: {
				groupId: group.id,
				invitedTo: payload.email || payload.phone || payload.userId,
			},
		});

		return { inviteToken, memberId: newMember.id };
	});
}

export async function acceptGroupInvitation(payload: AcceptInvitePayload) {
	return db.transaction(async (tx) => {
		const [member] = await tx
			.select()
			.from(formGroupMembers)
			.where(
				and(
					eq(formGroupMembers.inviteToken, payload.inviteToken),
					eq(formGroupMembers.isInviteAccepted, false), // Only unaccepted invites
				),
			);

		if (!member) {
			tx.rollback();
			throw new Error("Invalid or expired invitation token.");
		}
		if (member.userId && member.userId !== payload.userId) {
			tx.rollback();
			throw new Error("Invitation is for a different user.");
		}
		if (!member.userId) {
			// If invite was by email/phone, link to userId now
			await tx
				.update(formGroupMembers)
				.set({ userId: payload.userId })
				.where(eq(formGroupMembers.id, member.id));
		}

		// Update member status and increment group count
		const [updatedMember] = await tx
			.update(formGroupMembers)
			.set({
				isInviteAccepted: true,
				joinedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(formGroupMembers.id, member.id))
			.returning();

		if (!updatedMember) {
			tx.rollback();
			throw new Error("Failed to accept invitation.");
		}

		await tx
			.update(formGroups)
			.set({
				currentMemberCount: sql`${formGroups.currentMemberCount} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(formGroups.id, updatedMember.groupId));

		await tx.insert(activities).values({
			userId: payload.userId,
			formId: member.formId, // Assuming formId can be derived from group or added to member
			type: "group_joined",
			description: `User '${payload.userId}' joined group '${member.groupId}'.`,
			resourceType: "form_group_member",
			resourceId: updatedMember.id,
			createdAt: new Date(),
			metadata: { groupId: updatedMember.groupId, userId: payload.userId },
		});

		// Caching Note: Invalidate cache for group members and the group itself.

		return updatedMember;
	});
}

// --- Group Payment Logic (Partial/Full) ---

// This function processes a payment related to a group.
// It intelligently handles whether it's a full group payment or a partial contribution by a member.
export async function processGroupPayment(payload: GroupPaymentDetails) {
	return db.transaction(async (tx) => {
		const group = await tx.query.formGroups.findFirst({
			where: eq(formGroups.id, payload.groupId),
			with: {
				form: {
					columns: {
						price: true,
						groupAmountPayable: true,
						registrationType: true,
					},
				},
			},
		});

		if (!group || !group.form) {
			tx.rollback();
			throw new Error("Group or associated form not found.");
		}
		if (group.form.registrationType !== "group") {
			tx.rollback();
			throw new Error(
				"Form is not configured for group registration payments.",
			);
		}

		const expectedPaymentAmount = group.form.groupAmountPayable
			? parseFloat(group.form.groupAmountPayable.toString()) // Group pays a fixed amount
			: parseFloat(group.form.price.toString()); // Each member pays the base form price

		if (isNaN(expectedPaymentAmount) || expectedPaymentAmount <= 0) {
			tx.rollback();
			throw new Error(
				"Form or group payment amount is not defined or invalid.",
			);
		}

		// 1. Create the Payment Record
		const [newPayment] = await tx
			.insert(payments)
			.values({
				userId: payload.payerId,
				amount: payload.amount,
				status: "completed",
				createdAt: new Date(),
				updatedAt: new Date(),
				...payload,
			})
			.returning();

		if (!newPayment) {
			tx.rollback();
			throw new Error("Failed to record payment.");
		}

		// 2. Link Payment to Group or Group Member
		if (group.form.groupAmountPayable) {
			// This is a group-level payment. The group leader or an authorized member pays the fixed group price.
			// Update the group's paymentId.
			// You might need a more complex logic here if multiple partial payments can contribute to the group's total.
			// For simplicity, let's assume the first payment is the primary group payment.
			// Or, if this is a system that allows multiple payments for one group, you'd need a `group_payments` junction table
			// like `form_payments` or `group_member_payments`.
			await tx
				.update(formGroups)
				.set({
					paymentId: newPayment.id,
					updatedAt: new Date(),
					status: "published", // Assuming payment means group is now 'active'
				})
				.where(eq(formGroups.id, group.id));

			// Log activity for group payment
			await tx.insert(activities).values({
				userId: payload.payerId,
				formId: group.formId,
				type: "payment_received",
				description: `Group payment of ${payload.amount / 100} received for group '${group.groupName}'.`,
				resourceType: "form_group",
				resourceId: group.id,
				createdAt: new Date(),
				metadata: {
					groupId: group.id,
					paymentId: newPayment.id,
					amount: payload.amount,
				},
			});
		} else {
			// Each member pays individually. Link this payment to a specific group member.
			const groupMember = await tx.query.formGroupMembers.findFirst({
				where: and(
					eq(formGroupMembers.groupId, group.id),
					eq(formGroupMembers.userId, payload.payerId), // Payer must be a member
				),
			});

			if (!groupMember) {
				tx.rollback();
				throw new Error("Payer is not a member of this group.");
			}
			if (groupMember.paymentId) {
				tx.rollback();
				throw new Error("This group member has already made their payment.");
			}

			// Update the group member's paymentId
			await tx
				.update(formGroupMembers)
				.set({
					paymentId: newPayment.id,
					updatedAt: new Date(),
				})
				.where(eq(formGroupMembers.id, groupMember.id));

			// Log activity for member payment
			await tx.insert(activities).values({
				userId: payload.payerId,
				formId: group.formId,
				type: "payment_received",
				description: `Payment of ${payload.amount / 100} received from member '${payload.payerId}' for group '${group.groupName}'.`,
				resourceType: "form_group_member",
				resourceId: groupMember.id,
				createdAt: new Date(),
				metadata: {
					groupId: group.id,
					memberId: groupMember.id,
					paymentId: newPayment.id,
					amount: payload.amount,
				},
			});
		}

		// Caching Note: Invalidate cache for relevant group, form, and member data.

		return newPayment;
	});
}

// Function to get group details
export async function getFormGroupDetails(groupId: string) {
	// Caching Note: Check cache first, then fetch and cache.
	try {
		const group = await db.query.formGroups.findFirst({
			where: eq(formGroups.id, groupId),
			with: {
				form: {
					columns: {
						id: true,
						title: true,
						slug: true,
						price: true,
						groupAmountPayable: true,
						registrationType: true,
					},
				},
				leader: {
					columns: { id: true, email: true, name: true },
				},
				members: {
					with: {
						user: {
							columns: { id: true, email: true, name: true },
						},
						submission: {
							// Link to their submission if any
							columns: { id: true, status: true, submittedAt: true },
						},
						payment: {
							// Link to their individual payment if any
							columns: { id: true, amount: true, status: true, paidAt: true },
						},
					},
				},
				groupPayment: true, // The primary group payment
			},
		});
		// Caching Note: cache.set(...)
		return group;
	} catch (error) {
		console.error("Error fetching group details:", error);
		throw new Error("Failed to retrieve group details.");
	}
}
