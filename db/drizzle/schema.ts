import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, unique, int, varchar, text, timestamp, longtext, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const forms = mysqlTable("forms", {
	id: int("id").autoincrement().notNull(),
	formUuid: varchar("form_uuid", { length: 255 }).notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	formName: varchar("form_name", { length: 255 }).notNull(),
	formDescription: text("form_description").default('NULL'),
	paymentDetails: int("payment_details").default('NULL').references(() => paymentDetails.id, { onDelete: "set null", onUpdate: "restrict" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		paymentDetails: index("payment_details").on(table.paymentDetails),
		formUuid: unique("form_uuid").on(table.formUuid),
	}
});

export const formFields = mysqlTable("form_fields", {
	id: int("id").autoincrement().notNull(),
	formId: int("form_id").notNull().references(() => forms.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	fieldName: varchar("field_name", { length: 255 }).notNull(),
	fieldDescription: text("field_description").default('NULL'),
	fieldType: varchar("field_type", { length: 255 }).notNull(),
	fieldOptions: longtext("field_options").default('NULL'),
	formPosition: int("form_position").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	required: tinyint("required").default(0).notNull(),
}
(table) => {
	return {
		formId: index("form_id").on(table.formId),
		fieldName: unique("field_name").on(table.fieldName),
	}
});

export const formPayments = mysqlTable("form_payments", {
	id: int("id").autoincrement().notNull(),
	formId: int("form_id").notNull().references(() => forms.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	amount: int("amount").notNull(),
	paybill: varchar("paybill", { length: 30 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		formId: index("form_id").on(table.formId),
	}
});

export const orders = mysqlTable("orders", {
	id: int("id").autoincrement().notNull(),
	orderId: varchar("order_id", { length: 255 }).notNull(),
	phone: varchar("phone", { length: 255 }).notNull(),
	amount: int("amount").notNull(),
	paid: tinyint("paid").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const payments = mysqlTable("payments", {
	id: int("id").autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	amount: int("amount").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
	}
});

export const paymentDetails = mysqlTable("payment_details", {
	id: int("id").autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	paybill: varchar("paybill", { length: 30 }).notNull(),
	amount: int("amount").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
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
		userId: unique("user_id").on(table.userId),
	}
});

export const responseData = mysqlTable("response_data", {
	id: int("id").autoincrement().notNull(),
	responseId: int("response_id").notNull().references(() => responses.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	formFieldId: int("form_field_id").notNull().references(() => formFields.id, { onDelete: "cascade", onUpdate: "restrict" } ),
	value: text("value").default('NULL'),
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

export const sysLogs = mysqlTable("sys_logs", {
	id: int("id").autoincrement().notNull(),
	type: varchar("type", { length: 10 }).notNull(),
	message: text("message").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const users = mysqlTable("users", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
	salt: varchar("salt", { length: 255 }).notNull(),
	isDeleted: tinyint("is_deleted").default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => {
	return {
		email: unique("email").on(table.email),
	}
});