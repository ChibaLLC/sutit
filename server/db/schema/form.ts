// schemas/database.schema.ts
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
import { formGroupMemberPayments, formPayments, payments } from "./payments";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
  "pending",
]);
export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "published",
  "archived",
  "closed",
]);
export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "completed",
  "partial",
  "abandoned",
  "processing",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "cancelled",
]);
export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);
export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "textarea",
  "number",
  "email",
  "phone",
  "url",
  "date",
  "time",
  "datetime",
  "select",
  "multiselect",
  "radio",
  "checkbox",
  "toggle",
  "file",
  "image",
  "signature",
  "rating",
  "scale",
  "matrix",
  "section",
  "payment",
  "hidden",
  "calculated",
]);
export const workflowStatusEnum = pgEnum("workflow_status", [
  "active",
  "inactive",
  "completed",
  "failed",
]);
export const registrationTypeEnum = pgEnum("registration_type", [
  "single",
  "recurring",
  "group",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "form_created",
  "form_updated",
  "form_published",
  "form_archived",
  "form_deleted",
  "submission_received",
  "submission_completed",
  "store_created",
  "store_updated",
  "store_item_added",
  "store_item_updated",
  "payment_received",
  "user_registered",
]);
export const forms = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdBy: text("created_by")
      .references(() => user.id)
      .notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    status: formStatusEnum("status").default("draft"),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    isPublic: boolean("is_public").default(false),
    isFeatured: boolean("is_featured").default(false),
    requiresLogin: boolean("requires_login").default(false),
    allowMultipleSubmissions: boolean("allow_multiple_submissions").default(
      false,
    ),
    allowRegistrationReuse: boolean("allow_registration_reuse").default(false), // for recurring events
    submissionLimit: integer("submission_limit"),
    tags: jsonb("tags").default([]),
    price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
    requireMerch: boolean("require_merch").default(false),
    allowGroups: boolean("allow_groups").default(false),
    calculateTat: boolean("calculate_tat").default(false),
    groupAmountPayable: decimal("group_amount_payable", {
      precision: 10,
      scale: 2,
    }),
    groupMemberLimit: integer("group_member_limit"),
    infoPromptMessage: text("info_prompt_message"),
    afterSubmissionMessage: text("after_submission_message"),
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    slugUserUnique: unique("form_slug_user_unique").on(
      table.slug,
      table.createdBy,
    ),
    statusIdx: index("form_status_idx").on(table.status),
    createdByIdx: index("form_created_by_idx").on(table.createdBy),
    createdAtIdx: index("form_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("form_updated_at_idx").on(table.updatedAt),
  }),
);

export const formPages = pgTable(
  "form_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .references(() => forms.id)
      .notNull(),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    formIdx: index("page_form_idx").on(table.formId),
    orderIdx: index("page_order_idx").on(table.orderIndex),
    createdAtIdx: index("page_created_at_idx").on(table.createdAt),
  }),
);

export const formFields = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .references(() => formPages.id)
      .notNull(),
    type: fieldTypeEnum("field_type").notNull(),
    label: varchar("label", { length: 500 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    placeholder: varchar("placeholder", { length: 500 }),
    properties: jsonb("properties").default({}),
    validation: jsonb("validation").default({}),
    options: jsonb("options").default([]),
    conditions: jsonb("conditions").default({}),
    required: boolean("required").default(false),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pageIdx: index("field_page_idx").on(table.pageId),
    nameIdx: index("field_name_idx").on(table.name),
    createdAtIdx: index("field_created_at_idx").on(table.createdAt),
  }),
);

export const formStores = pgTable(
  "form_stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .references(() => forms.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    formIdx: index("store_form_idx").on(table.formId),
    createdAtIdx: index("store_created_at_idx").on(table.createdAt),
  }),
);

export const storeItems = pgTable(
  "store_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .references(() => formStores.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").default(0),
    isInfinite: boolean("is_infinite").default(false),
    images: jsonb("images").default([]),
    isActive: boolean("is_active").default(true),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    storeIdx: index("item_store_idx").on(table.storeId),
    activeIdx: index("item_active_idx").on(table.isActive),
    createdAtIdx: index("item_created_at_idx").on(table.createdAt),
  }),
);
export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    formId: uuid("form_id")
      .references(() => forms.id, { onDelete: "cascade" })
      .notNull(),

    type: activityTypeEnum("type").notNull(),
    description: text("description").notNull(),
    resourceType: varchar("resource_type", { length: 100 }), // form, submission, store, etc.
    resourceId: uuid("resource_id"),
    metadata: jsonb("metadata").default({}),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("activity_user_idx").on(table.userId),
    typeIdx: index("activity_type_idx").on(table.type),
    resourceIdx: index("activity_resource_idx").on(
      table.resourceType,
      table.resourceId,
    ),
    createdAtIdx: index("activity_created_at_idx").on(table.createdAt),
  }),
);
export const formGroups = pgTable(
  "form_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(), // Changed from ULID to UUID
    formId: uuid("form_id") // Foreign key to the form this group belongs to
      .references(() => forms.id, { onDelete: "cascade" })
      .notNull(),
    groupName: varchar("group_name", { length: 255 }).notNull(),
    // Changed leaderId from createdBy to allow a group leader distinct from form creator
    leaderId: text("leader_id").references(() => user.id, {
      onDelete: "set null",
    }), // User who created/leads the group
    paymentId: uuid("payment_id") // Link to the payment for the entire group
      .references(() => payments.id, { onDelete: "set null" }),
    currentMemberCount: integer("current_member_count").default(0).notNull(),
    maxMembers: integer("max_members"), // Inherited from form.groupMemberLimit but can be overridden
    inviteCode: varchar("invite_code", { length: 50 }).unique(), // Unique code for inviting members
    status: formStatusEnum("status").default("draft"), // Or a group-specific status enum
    metadata: jsonb("metadata").default({}), // Additional group-specific data
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    groupNameFormUnique: unique("group_name_form_unique").on(
      table.groupName,
      table.formId,
    ), // Unique group name per form
    formIdIdx: index("form_group_form_id_idx").on(table.formId),
    leaderIdIdx: index("form_group_leader_id_idx").on(table.leaderId),
    paymentIdIdx: index("form_group_payment_id_idx").on(table.paymentId),
    inviteCodeIdx: index("form_group_invite_code_idx").on(table.inviteCode),
  }),
);

export const formGroupMembers = pgTable(
  "form_group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .references(() => formGroups.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    submissionId: uuid("submission_id").references(() => formSubmissions.id, {
      onDelete: "set null",
    }),
    paymentId: uuid("payment_id").references(() => payments.id, {
      onDelete: "set null",
    }),
    // For invite management:
    inviteEmail: varchar("invite_email", { length: 255 }),
    invitePhone: varchar("invite_phone", { length: 50 }),
    inviteToken: varchar("invite_token", { length: 255 }).unique(),
    isInviteAccepted: boolean("is_invite_accepted").default(false),
    role: varchar("role", { length: 50 }).default("member").notNull(),
    joinedAt: timestamp("joined_at"),
    invitedAt: timestamp("invited_at").defaultNow().notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    groupUserUnique: unique("group_member_group_user_unique").on(
      table.groupId,
      table.userId,
    ), // A user can only be a member of a group once
    groupEmailUnique: unique("group_member_group_email_unique").on(
      table.groupId,
      table.inviteEmail,
    ), // An email can only be invited to a group once
    groupPhoneUnique: unique("group_member_group_phone_unique").on(
      table.groupId,
      table.invitePhone,
    ), // A phone can only be invited to a group once
    groupIdx: index("form_group_member_group_id_idx").on(table.groupId),
    userIdx: index("form_group_member_user_id_idx").on(table.userId),
    submissionIdx: index("form_group_member_submission_id_idx").on(
      table.submissionId,
    ),
    inviteTokenIdx: index("form_group_member_invite_token_idx").on(
      table.inviteToken,
    ),
  }),
);
// ============================================
// REGISTRATION & SUBMISSION MANAGEMENT
// ============================================

export const formSubmissions = pgTable(
  "form_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .references(() => forms.id)
      .notNull(),
    submitterId: text("submitter_id").references(() => user.id),
    status: submissionStatusEnum("status").default("pending"),
    metadata: jsonb("metadata").default({}),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    pricePaid: integer("price_paid"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    formIdx: index("submission_form_idx").on(table.formId),
    statusIdx: index("submission_status_idx").on(table.status),
    submitterIdx: index("submission_submitter_idx").on(table.submitterId),
    submittedAtIdx: index("submission_submitted_at_idx").on(table.submittedAt),
    completedAtIdx: index("submission_completed_at_idx").on(table.completedAt),
    updatedAtIdx: index("submission_updated_at_idx").on(table.updatedAt),
  }),
);

export const fieldResponses = pgTable(
  "field_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .references(() => formSubmissions.id)
      .notNull(),
    fieldId: uuid("field_id")
      .references(() => formFields.id)
      .notNull(),
    value: text("value"),
    parsedValue: jsonb("parsed_value"), // for complex field types
    validationStatus: jsonb("validation_status"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    submissionFieldUnique: unique("response_submission_field").on(
      table.submissionId,
      table.fieldId,
    ),
    submissionIdx: index("response_submission_idx").on(table.submissionId),
    fieldIdx: index("response_field_idx").on(table.fieldId),
    createdAtIdx: index("response_created_at_idx").on(table.createdAt),
    updatedAtIdx: index("response_updated_at_idx").on(table.updatedAt),
  }),
);

export const storeResponses = pgTable("store_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .references(() => formSubmissions.id)
    .notNull(),
  storeItemId: uuid("store_item_id").references(() => storeItems.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// ANALYTICS
// ============================================

export const formAnalytics = pgTable(
  "form_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .references(() => forms.id)
      .notNull(),
    analyticsDate: date("analytics_date").notNull(),
    views: integer("views").default(0),
    uniqueViews: integer("unique_views").default(0),
    submissions: integer("submissions").default(0),
    completionRate: real("completion_rate"),
    avgCompletionTime: integer("avg_completion_time"), // in seconds
    bounceRate: real("bounce_rate"),
    detailedStats: jsonb("detailed_stats").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    formDateUnique: unique("analytics_form_date").on(
      table.formId,
      table.analyticsDate,
    ),
    formIdx: index("analytics_form_idx").on(table.formId),
    dateIdx: index("analytics_date_idx").on(table.analyticsDate),
    createdAtIdx: index("analytics_created_at_idx").on(table.createdAt),
  }),
);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(user, ({ one, many }) => ({
  forms: many(forms),
  submissions: many(formSubmissions),
  formGroups: many(formGroups),
  groupMemberships: many(formGroupMembers),
  activities: many(activities),
  payments: many(payments),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  creator: one(user, {
    fields: [forms.createdBy],
    references: [user.id],
  }),
  pages: many(formPages),
  submissions: many(formSubmissions),
  analytics: many(formAnalytics),
  stores: many(formStores),
  groups: many(formGroups),
  formPayments: many(payments),
}));

export const formPagesRelations = relations(formPages, ({ one, many }) => ({
  form: one(forms, {
    fields: [formPages.formId],
    references: [forms.id],
  }),
  fields: many(formFields),
}));

export const formFieldsRelations = relations(formFields, ({ one, many }) => ({
  page: one(formPages, {
    fields: [formFields.pageId],
    references: [formPages.id],
  }),
  responses: many(fieldResponses),
}));

export const formStoreRelations = relations(formStores, ({ one, many }) => ({
  form: one(forms, {
    fields: [formStores.formId],
    references: [forms.id],
  }),
  items: many(storeItems),
}));

export const storeItemsRelations = relations(storeItems, ({ one }) => ({
  store: one(formStores, {
    fields: [storeItems.storeId],
    references: [formStores.id],
  }),
}));
export const fieldResponsesRelations = relations(fieldResponses, ({ one }) => ({
  submission: one(formSubmissions, {
    fields: [fieldResponses.submissionId],
    references: [formSubmissions.id],
  }),
  field: one(formFields, {
    fields: [fieldResponses.fieldId],
    references: [formFields.id],
  }),
}));
export const storeResponsesRelations = relations(
  storeResponses,
  ({ one, many }) => ({
    submission: one(formSubmissions, {
      fields: [storeResponses.submissionId],
      references: [formSubmissions.id],
    }),
    item: one(storeItems, {
      fields: [storeResponses.storeItemId],
      references: [storeItems.id],
    }),
  }),
);

export const formAnalyticsRelations = relations(formAnalytics, ({ one }) => ({
  form: one(forms, {
    fields: [formAnalytics.formId],
    references: [forms.id],
  }),
}));

export const formSubmissionsRelations = relations(
  formSubmissions,
  ({ one, many }) => ({
    form: one(forms, {
      fields: [formSubmissions.formId],
      references: [forms.id],
    }),

    submitter: one(user, {
      fields: [formSubmissions.submitterId],
      references: [user.id],
    }),
    responses: many(fieldResponses),
    storeResponses: many(storeResponses),
    payments: one(formPayments),
  }),
);

export const formGroupsRelations = relations(formGroups, ({ one, many }) => ({
  form: one(forms, {
    fields: [formGroups.formId],
    references: [forms.id],
  }),
  leader: one(user, {
    fields: [formGroups.leaderId],
    references: [user.id],
  }),
  payment: one(payments, {
    fields: [formGroups.paymentId],
    references: [payments.id],
  }),
  members: many(formGroupMembers),
  memberPayments: many(formGroupMemberPayments),
}));

export const formGroupMembersRelations = relations(
  formGroupMembers,
  ({ one, many }) => ({
    group: one(formGroups, {
      fields: [formGroupMembers.groupId],
      references: [formGroups.id],
    }),
    user: one(user, {
      fields: [formGroupMembers.userId],
      references: [user.id],
    }),
    submission: one(formSubmissions, {
      fields: [formGroupMembers.submissionId],
      references: [formSubmissions.id],
    }),
    payment: one(payments, {
      fields: [formGroupMembers.paymentId],
      references: [payments.id],
    }),
    memberPayments: many(formGroupMemberPayments),
  }),
);
