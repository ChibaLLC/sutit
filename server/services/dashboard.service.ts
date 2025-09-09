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
} from "../db/schema"; // Assuming all are in form.ts for now
import { sql, eq, and, desc, count, sum, gte, lte } from "drizzle-orm";

export interface DashboardStats {
	totalForms: number;
	totalSubmissions: number;
	totalActiveUsers: number;
	totalPaymentsValue: number; // Sum of all completed payments
	totalGroups: number;
}

export async function getOverallDashboardStats(): Promise<DashboardStats> {
	// Caching Note: This is a good candidate for a dashboard-wide cache, e.g., for 5-15 minutes.
	// Invalidate when new forms, submissions, payments, users, or groups are created/updated.
	try {
		const [
			{ totalForms },
			{ totalSubmissions },
			{ totalActiveUsers },
			{ totalPaymentsValue },
			{ totalGroups },
		] = await Promise.all([
			db.select({ totalForms: count(forms.id) }).from(forms),
			db
				.select({ totalSubmissions: count(formSubmissions.id) })
				.from(formSubmissions),
			db
				.select({ totalActiveUsers: count(user.id) })
				.from(user)
				.where(eq(user.status, userStatusEnum.enumValues[0])), // 'active'
			db
				.select({
					totalPaymentsValue: sql<number>`sum(${payments.amount}) / 100`,
				})
				.from(payments)
				.where(eq(payments.status, "completed")),
			db.select({ totalGroups: count(formGroups.id) }).from(formGroups),
		]);

		return {
			totalForms: totalForms || 0,
			totalSubmissions: totalSubmissions || 0,
			totalActiveUsers: totalActiveUsers || 0,
			totalPaymentsValue: totalPaymentsValue || 0,
			totalGroups: totalGroups || 0,
		};
	} catch (error) {
		console.error("Error fetching overall dashboard stats:", error);
		throw new Error("Failed to retrieve dashboard statistics.");
	}
}

// --- Recent Activities ---
export async function getRecentActivities(limit: number = 10) {
	// Caching Note: Cache this list for a short period. Invalidate on any new activity insertion.
	try {
		const recentActivities = await db.query.activities.findMany({
			orderBy: (activity, { desc }) => [desc(activity.createdAt)],
			limit: limit,
			with: {
				// If you want to link activities back to the user or form that caused them
				user: {
					columns: { id: true, email: true, name: true },
				},
				form: {
					columns: { id: true, title: true, slug: true },
				},
			},
		});
		return recentActivities;
	} catch (error) {
		console.error("Error fetching recent activities:", error);
		throw new Error("Failed to retrieve recent activities.");
	}
}

// --- User-Specific Dashboard (e.g., for a user's forms, submissions, and groups) ---
export interface UserDashboardData {
	myForms: (typeof forms.$inferSelect)[];
	mySubmissions: Array<
		typeof formSubmissions.$inferSelect & { formTitle: string }
	>;
	myGroups: Array<typeof formGroups.$inferSelect & { formTitle: string }>;
	myGroupMemberships: Array<
		typeof formGroupMembers.$inferSelect & {
			groupName: string;
			formTitle: string;
		}
	>;
}

export async function getUserDashboardData(
	userId: string,
): Promise<UserDashboardData> {
	// Caching Note: Cache per user. Invalidate when user creates/updates forms, submissions, groups, memberships.
	try {
		const [myForms, mySubmissions, myGroups, myGroupMemberships] =
			await Promise.all([
				db.query.forms.findMany({
					where: eq(forms.createdBy, userId),
					orderBy: (f, { desc }) => [desc(f.createdAt)],
					limit: 5, // Show recent forms
				}),
				db
					.select({
						...formSubmissions,
						formTitle: forms.title,
					})
					.from(formSubmissions)
					.leftJoin(forms, eq(formSubmissions.formId, forms.id))
					.where(eq(formSubmissions.submitterId, userId))
					.orderBy(desc(formSubmissions.submittedAt))
					.limit(5), // Show recent submissions
				db
					.select({
						...formGroups,
						formTitle: forms.title,
					})
					.from(formGroups)
					.leftJoin(forms, eq(formGroups.formId, forms.id))
					.where(eq(formGroups.leaderId, userId))
					.orderBy(desc(formGroups.createdAt))
					.limit(5), // Show groups led by user
				db
					.select({
						...formGroupMembers,
						groupName: formGroups.groupName,
						formTitle: forms.title,
					})
					.from(formGroupMembers)
					.leftJoin(formGroups, eq(formGroupMembers.groupId, formGroups.id))
					.leftJoin(forms, eq(formGroups.formId, forms.id))
					.where(eq(formGroupMembers.userId, userId))
					.orderBy(desc(formGroupMembers.joinedAt))
					.limit(5), // Show groups user is a member of
			]);

		return {
			myForms,
			mySubmissions: mySubmissions.filter((s) => s.formId), // Filter out submissions without forms if leftJoin yields null
			myGroups: myGroups.filter((g) => g.formId),
			myGroupMemberships: myGroupMemberships.filter((m) => m.groupId),
		};
	} catch (error) {
		console.error("Error fetching user dashboard data:", error);
		throw new Error("Failed to retrieve user dashboard data.");
	}
}

// --- Form Analytics by Date Range ---
export interface FormAnalyticsSummary {
	totalViews: number;
	uniqueViews: number;
	totalSubmissions: number;
	avgCompletionRate: number; // Average of completion_rate field
	avgCompletionTime: number; // Average of avg_completion_time
}

export async function getFormAnalyticsSummary(
	formId: string,
	startDate: Date,
	endDate: Date,
): Promise<FormAnalyticsSummary> {
	try {
		const [summary] = await db
			.select({
				totalViews: sql<number>`sum(${formAnalytics.views})`,
				uniqueViews: sql<number>`sum(${formAnalytics.uniqueViews})`,
				totalSubmissions: sql<number>`sum(${formAnalytics.submissions})`,
				avgCompletionRate: sql<number>`avg(${formAnalytics.completionRate})`,
				avgCompletionTime: sql<number>`avg(${formAnalytics.avgCompletionTime})`,
			})
			.from(formAnalytics)
			.where(
				and(
					eq(formAnalytics.formId, formId),
					gte(
						formAnalytics.analyticsDate,
						startDate.toISOString().split("T")[0],
					),
					lte(formAnalytics.analyticsDate, endDate.toISOString().split("T")[0]),
				),
			);

		return {
			totalViews: summary.totalViews || 0,
			uniqueViews: summary.uniqueViews || 0,
			totalSubmissions: summary.totalSubmissions || 0,
			avgCompletionRate: summary.avgCompletionRate || 0,
			avgCompletionTime: summary.avgCompletionTime || 0,
		};
	} catch (error) {
		console.error("Error fetching form analytics summary:", error);
		throw new Error("Failed to retrieve form analytics summary.");
	}
}
