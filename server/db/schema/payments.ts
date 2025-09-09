import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	jsonb,
	uuid,
	varchar,
	decimal,
	pgEnum,
	unique,
	index,
	primaryKey,
	date,
	real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { formGroups, forms, formSubmissions } from "./form";
export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"completed",
	"failed",
	"refunded",
	"partial",
	"deferred",
	"authorized", // Added for multi-step payment flows
	"cancelled", // Added for clarity
]);
export const payments = pgTable(
	"payments",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id").references(() => user.id),
		referenceCode: varchar("reference_code", { length: 30 }),
		merchantId: text("merchant_id").notNull(),
		checkoutId: text("checkout_id").notNull(),
		phoneNumber: varchar("phone_number", { length: 30 }).notNull(),
		amount: integer("amount").notNull(),
		receiptNumber: varchar("receipt_number", { length: 255 }),
		status: paymentStatusEnum("status").default("pending").notNull(),
		metadata: jsonb("metadata").default({}),
		paidAt: timestamp("paid_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => ({
		userIdIdx: index("payment_user_id_idx").on(table.userId),
		statusIdx: index("payment_status_idx").on(table.status),
		createdAtIdx: index("payment_created_at_idx").on(table.createdAt),
	}),
);
export const formPayments = pgTable(
	"form_payments",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		formId: uuid("form_id")
			.notNull()
			.references(() => forms.id, { onDelete: "cascade" }),
		paymentId: uuid("payment_id")
			.notNull()
			.references(() => payments.id, { onDelete: "cascade" }),
		submissionId: uuid("submission_id")
			.notNull()
			.references(() => formSubmissions.id),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => {
		return {
			formIdIdx: index("form_payment_form_id_idx").on(table.formId),
			paymentIdIdx: index("form_payment_payment_id_idx").on(table.paymentId),
			formSubmission: index("form_payment_submission_idx").on(
				table.submissionId,
			),
		};
	},
);

export const paymentsRelations = relations(payments, ({ one, many }) => ({
	user: one(user, {
		fields: [payments.userId],
		references: [user.id],
	}),
	formPayments: many(formPayments),
	groupPayments: one(formGroups, {
		fields: [payments.id],
		references: [formGroups.paymentId],
	}),
}));

export const formPaymentsRelations = relations(formPayments, ({ one }) => ({
	form: one(forms, {
		fields: [formPayments.formId],
		references: [forms.id],
	}),
	payment: one(payments, {
		fields: [formPayments.paymentId],
		references: [payments.id],
	}),
	submission: one(formSubmissions, {
		fields: [formPayments.submissionId],
		references: [formSubmissions.id],
	}),
}));
