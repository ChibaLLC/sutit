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
export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"completed",
	"failed",
	"refunded",
	"partial",
	"deferred",
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
	"date",
	"time",
	"datetime",
	"select",
	"multiselect",
	"radio",
	"checkbox",
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
		settings: jsonb("settings").default({}),
		theme: jsonb("theme").default({}),
		slug: varchar("slug", { length: 255 }).notNull(),
		isPublic: boolean("is_public").default(false),
		requiresLogin: boolean("requires_login").default(false),
		allowMultipleSubmissions: boolean("allow_multiple_submissions").default(
			false,
		),
		allowRegistrationReuse: boolean("allow_registration_reuse").default(false), // for recurring events
		submissionLimit: integer("submission_limit"),
		registrationType:
			registrationTypeEnum("registration_type").default("single"),
		tags: jsonb("tags").default([]),
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

export const formSections = pgTable(
	"form_sections",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		formId: uuid("form_id")
			.references(() => forms.id)
			.notNull(),
		title: varchar("title", { length: 255 }),
		description: text("description"),
		orderIndex: integer("order_index").notNull(),
		conditions: jsonb("conditions").default({}), // visibility logic
		repeatable: boolean("repeatable").default(false), // for dynamic sections
		maxRepetitions: integer("max_repetitions"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		formIdx: index("section_form_idx").on(table.formId),
		orderIdx: index("section_order_idx").on(table.orderIndex),
		createdAtIdx: index("section_created_at_idx").on(table.createdAt),
	}),
);

export const formFields = pgTable(
	"form_fields",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		sectionId: uuid("section_id")
			.references(() => formSections.id)
			.notNull(),
		fieldType: fieldTypeEnum("field_type").notNull(),
		label: varchar("label", { length: 500 }).notNull(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		placeholder: varchar("placeholder", { length: 500 }),
		properties: jsonb("properties").default({}), // field-specific config
		validation: jsonb("validation").default({}), // validation rules
		conditions: jsonb("conditions").default({}), // conditional logic
		required: boolean("required").default(false),
		orderIndex: integer("order_index").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		sectionIdx: index("field_section_idx").on(table.sectionId),
		nameIdx: index("field_name_idx").on(table.name),
		createdAtIdx: index("field_created_at_idx").on(table.createdAt),
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
		ipAddress: varchar("ip_address", { length: 45 }),
		userAgent: text("user_agent"),
		source: varchar("source", { length: 100 }), // web, mobile, api, etc.
		submittedAt: timestamp("submitted_at").defaultNow().notNull(),
		completedAt: timestamp("completed_at"),
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
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
	creator: one(user, {
		fields: [forms.createdBy],
		references: [user.id],
	}),
	sections: many(formSections),
	submissions: many(formSubmissions),
	analytics: many(formAnalytics),
}));

export const formSectionsRelations = relations(
	formSections,
	({ one, many }) => ({
		version: one(forms, {
			fields: [formSections.formId],
			references: [forms.id],
		}),
		fields: many(formFields),
	}),
);

export const formFieldsRelations = relations(formFields, ({ one, many }) => ({
	section: one(formSections, {
		fields: [formFields.sectionId],
		references: [formSections.id],
	}),
	responses: many(fieldResponses),
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
	}),
);
