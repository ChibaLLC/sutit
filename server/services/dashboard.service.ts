import db from "../db";
import {
  forms,
  formSubmissions,
  activities,
  formAnalytics,
  formGroups,
  formGroupMembers,
  userStatusEnum,
  user,
  payments,
  formPayments,
  formGroupMemberPayments,
} from "../db/schema"; // Assuming all are in form.ts for now
import { sql, eq, and, desc, count, sum, gte, lte } from "drizzle-orm";
export async function getUserDashboardStats(userId: string) {
  // 1. Forms created
  const [{ count: totalForms }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(forms)
    .where(eq(forms.createdBy, userId));

  // 2. Submissions received across their forms
  const [{ count: submissionsReceived }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(formSubmissions)
    .innerJoin(forms, eq(forms.id, formSubmissions.formId))
    .where(eq(forms.createdBy, userId));

  // 3. Submissions user made
  const [{ count: submissionsMade }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(formSubmissions)
    .where(eq(formSubmissions.submitterId, userId));

  // 4. Revenue (payments linked to forms owned by the user)
  const [{ revenue }] = await db
    .select({ revenue: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(formPayments)
    .innerJoin(forms, eq(forms.id, formPayments.formId))
    .innerJoin(payments, eq(payments.id, formPayments.paymentId))
    .where(eq(forms.createdBy, userId));

  // 5. Payments user made (self as payer)
  const [{ spent }] = await db
    .select({ spent: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.userId, userId));

  // 6. Groups created
  const [{ count: groupsCreated }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(formGroups)
    .where(eq(formGroups.leaderId, userId));

  // 7. Groups joined
  const [{ count: groupsJoined }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(formGroupMembers)
    .where(eq(formGroupMembers.userId, userId));

  // 8. Group member payments made by this user
  const [{ groupPaymentsMade }] = await db
    .select({
      groupPaymentsMade: sql<number>`COALESCE(SUM(${formGroupMemberPayments.amount}), 0)`,
    })
    .from(formGroupMemberPayments)
    .where(eq(formGroupMemberPayments.paidBy, userId));

  // 9. Activity (optional, if you want last X actions)
  const [{ activityCount }] = await db
    .select({ activityCount: sql<number>`COUNT(*)` })
    .from(activities)
    .where(eq(activities.userId, userId));

  return {
    forms: {
      total: Number(totalForms),
      submissionsReceived: Number(submissionsReceived),
    },
    submissions: {
      made: Number(submissionsMade),
    },
    payments: {
      revenue: Number(revenue), // earned as form creator
      spent: Number(spent), // personal payments
      groupPayments: Number(groupPaymentsMade), // group member contributions
    },
    groups: {
      created: Number(groupsCreated),
      joined: Number(groupsJoined),
    },
    activities: {
      total: Number(activityCount),
    },
  };
}
