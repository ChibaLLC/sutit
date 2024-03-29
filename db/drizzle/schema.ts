import { pgTable, unique, serial, varchar, boolean, timestamp, index, foreignKey, integer, text, json } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
	salt: varchar("salt", { length: 255 }).notNull(),
	isDeleted: boolean("is_deleted"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		usersEmailKey: unique("users_email_key").on(table.email),
	}
});

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id),
	token: varchar("token", { length: 255 }).notNull(),
	isValid: boolean("is_valid").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		tokenIdx: index("token_index").on(table.token),
		sessionsTokenKey: unique("sessions_token_key").on(table.token),
	}
});

export const paymentDetails = pgTable("payment_details", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull(),
	amount: integer("amount").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const forms = pgTable("forms", {
	id: serial("id").primaryKey().notNull(),
	formUuid: varchar("form_uuid", { length: 255 }).notNull(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	formName: varchar("form_name", { length: 255 }).notNull(),
	formDescription: text("form_description"),
	paymentDetails: integer("payment_details").references(() => paymentDetails.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		formsFormUuidKey: unique("forms_form_uuid_key").on(table.formUuid),
	}
});

export const formPayments = pgTable("form_payments", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" } ),
	phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
	referenceCode: varchar("reference_code", { length: 255 }).notNull(),
	amount: integer("amount").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const formFields = pgTable("form_fields", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" } ),
	fieldName: varchar("field_name", { length: 255 }).notNull(),
	fieldDescription: text("field_description"),
	fieldType: varchar("field_type", { length: 255 }).notNull(),
	fieldOptions: json("field_options"),
	formPosition: integer("form_position").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	required: boolean("required").default(false).notNull(),
});

export const responses = pgTable("responses", {
	id: serial("id").primaryKey().notNull(),
	formId: integer("form_id").notNull().references(() => forms.id, { onDelete: "cascade" } ),
	userId: integer("user_id").references(() => users.id, { onDelete: "cascade" } ),
	userUlid: varchar("user_ulid", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		responsesUserIdKey: unique("responses_user_id_key").on(table.userId),
		responsesUserUlidKey: unique("responses_user_ulid_key").on(table.userUlid),
	}
});

export const responseData = pgTable("response_data", {
	id: serial("id").primaryKey().notNull(),
	responseId: integer("response_id").notNull().references(() => responses.id, { onDelete: "cascade" } ),
	formFieldId: integer("form_field_id").notNull().references(() => formFields.id, { onDelete: "cascade" } ),
	value: text("value"),
});

export const payments = pgTable("payments", {
	id: serial("id").primaryKey().notNull(),
	userId: integer("user_id").notNull().references(() => users.id),
	amount: integer("amount").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const sysLogs = pgTable("sys_logs", {
	id: serial("id").primaryKey().notNull(),
	type: varchar("type", { length: 10 }).notNull(),
	message: text("message").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});