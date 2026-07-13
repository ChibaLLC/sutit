import { relations } from "drizzle-orm";
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

import { user } from "./auth";
import { formGroupMembers, formGroups, forms, formSubmissions } from "./form";
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

export const disbursementStatusEnum = pgEnum("disbursement_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const disbursementMethodEnum = pgEnum("disbursement_method", [
  "phone",
  "till",
  "paybill",
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
      formSubmission: index("form_payment_submission_idx").on(table.submissionId),
    };
  },
);

export const formGroupMemberPayments = pgTable(
  "form_group_member_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .references(() => formGroups.id, { onDelete: "cascade" })
      .notNull(),
    memberId: uuid("member_id")
      .references(() => formGroupMembers.id, { onDelete: "cascade" })
      .notNull(),
    paymentId: uuid("payment_id")
      .references(() => payments.id, { onDelete: "cascade" })
      .notNull(),
    paidBy: text("paid_by").references(() => user.id),
    amount: integer("amount").notNull(),
    paymentType: varchar("payment_type", { length: 50 }).default("self_paid").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    groupIdIdx: index("group_member_payment_group_id_idx").on(table.groupId),
    memberIdIdx: index("group_member_payment_member_id_idx").on(table.memberId),
    paymentIdIdx: index("group_member_payment_payment_id_idx").on(table.paymentId),
    paidByIdx: index("group_member_payment_paid_by_idx").on(table.paidBy),
    statusIdx: index("group_member_payment_status_idx").on(table.status),
  }),
);

/** Tracks payouts of collected form payments to form owners via B2C / B2B */
export const disbursements = pgTable(
  "disbursements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    method: disbursementMethodEnum("method").notNull(),
    destination: varchar("destination", { length: 100 }).notNull(),
    accountNumber: varchar("account_number", { length: 100 }),
    status: disbursementStatusEnum("status").default("pending").notNull(),
    conversationId: text("conversation_id"),
    originatorConversationId: text("originator_conversation_id"),
    transactionId: varchar("transaction_id", { length: 100 }),
    resultCode: integer("result_code"),
    resultDesc: text("result_desc"),
    metadata: jsonb("metadata").default({}),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    paymentIdIdx: index("disbursement_payment_id_idx").on(table.paymentId),
    formIdIdx: index("disbursement_form_id_idx").on(table.formId),
    statusIdx: index("disbursement_status_idx").on(table.status),
    conversationIdIdx: index("disbursement_conversation_id_idx").on(table.conversationId),
  }),
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
  groupMemberPayments: many(formGroupMemberPayments),
  disbursements: many(disbursements),
}));

export const disbursementsRelations = relations(disbursements, ({ one }) => ({
  payment: one(payments, {
    fields: [disbursements.paymentId],
    references: [payments.id],
  }),
  form: one(forms, {
    fields: [disbursements.formId],
    references: [forms.id],
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

export const formGroupMemberPaymentsRelations = relations(formGroupMemberPayments, ({ one }) => ({
  group: one(formGroups, {
    fields: [formGroupMemberPayments.groupId],
    references: [formGroups.id],
  }),
  member: one(formGroupMembers, {
    fields: [formGroupMemberPayments.memberId],
    references: [formGroupMembers.id],
  }),
  payment: one(payments, {
    fields: [formGroupMemberPayments.paymentId],
    references: [payments.id],
  }),
  paidBy: one(user, {
    fields: [formGroupMemberPayments.paidBy],
    references: [user.id],
  }),
}));
