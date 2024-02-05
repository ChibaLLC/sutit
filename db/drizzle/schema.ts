import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, unique, int, varchar, timestamp, tinyint, text } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const forms = mysqlTable("forms", {
	id: int("id").autoincrement().notNull(),
	formUuid: varchar("form_uuid", { length: 255 }).notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	formName: varchar("form_name", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		formUuid: unique("form_uuid").on(table.formUuid),
	}
});

export const formFields = mysqlTable("form_fields", {
	id: int("id").autoincrement().notNull(),
	formId: int("form_id").notNull().references(() => forms.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	fieldName: varchar("field_name", { length: 255 }).notNull(),
	fieldType: varchar("field_type", { length: 255 }).notNull(),
	required: tinyint("required").default(0),
},
(table) => {
	return {
		formId: index("form_id").on(table.formId),
		formFieldsFieldNameUnique: unique("form_fields_field_name_unique").on(table.fieldName),
	}
});

export const responses = mysqlTable("responses", {
	id: int("id").autoincrement().notNull(),
	formId: int("form_id").notNull().references(() => forms.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		formId: index("form_id").on(table.formId),
		responsesUserIdUnique: unique("responses_user_id_unique").on(table.userId),
	}
});

export const responseData = mysqlTable("response_data", {
	id: int("id").autoincrement().notNull(),
	responseId: int("response_id").notNull().references(() => responses.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	formFieldId: int("form_field_id").notNull().references(() => formFields.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	value: text("value").notNull(),
},
(table) => {
	return {
		responseId: index("response_id").on(table.responseId),
		formFieldId: index("form_field_id").on(table.formFieldId),
	}
});

export const sessions = mysqlTable("sessions", {
	id: int("id").autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	token: varchar("token", { length: 255 }).notNull(),
	isValid: tinyint("is_valid").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		tokenIdx: index("token_index").on(table.token),
		token: unique("token").on(table.token),
	}
});

export const users = mysqlTable("users", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
	salt: varchar("salt", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		email: unique("email").on(table.email),
	}
});