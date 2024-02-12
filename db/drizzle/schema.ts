import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, primaryKey, varchar, text, json, timestamp, tinyint, unique } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const formFields = mysqlTable("form_fields", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	formId: int("form_id", { unsigned: true }).notNull().references(() => forms.id, { onDelete: "cascade" } ),
	fieldName: varchar("field_name", { length: 255 }).notNull(),
	fieldDescription: text("field_description"),
	fieldType: varchar("field_type", { length: 255 }).notNull(),
	fieldOptions: json("field_options"),
	formPosition: int("form_position", { unsigned: true }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
	required: tinyint("required").default(0).notNull(),
},
(table) => {
	return {
		formId: index("form_id").on(table.formId),
		formFieldsId: primaryKey({ columns: [table.id], name: "form_fields_id"}),
	}
});

export const formPayments = mysqlTable("form_payments", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	formId: int("form_id", { unsigned: true }).notNull().references(() => forms.id, { onDelete: "cascade" } ),
	amount: int("amount", { unsigned: true }).notNull(),
	paybill: varchar("paybill", { length: 30 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		formId: index("form_id").on(table.formId),
		formPaymentsId: primaryKey({ columns: [table.id], name: "form_payments_id"}),
	}
});

export const forms = mysqlTable("forms", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	formUuid: varchar("form_uuid", { length: 255 }).notNull(),
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	formName: varchar("form_name", { length: 255 }).notNull(),
	formDescription: text("form_description"),
	paymentDetails: int("payment_details", { unsigned: true }).references(() => paymentDetails.id, { onDelete: "set null" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		paymentDetails: index("payment_details").on(table.paymentDetails),
		formsId: primaryKey({ columns: [table.id], name: "forms_id"}),
		formUuid: unique("form_uuid").on(table.formUuid),
	}
});

export const orders = mysqlTable("orders", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	orderId: varchar("order_id", { length: 255 }).notNull(),
	phone: varchar("phone", { length: 255 }).notNull(),
	amount: int("amount", { unsigned: true }).notNull(),
	paid: tinyint("paid").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		ordersId: primaryKey({ columns: [table.id], name: "orders_id"}),
	}
});

export const paymentDetails = mysqlTable("payment_details", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id),
	paybill: varchar("paybill", { length: 30 }).notNull(),
	amount: int("amount", { unsigned: true }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		paymentDetailsId: primaryKey({ columns: [table.id], name: "payment_details_id"}),
	}
});

export const payments = mysqlTable("payments", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id),
	amount: int("amount", { unsigned: true }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		paymentsId: primaryKey({ columns: [table.id], name: "payments_id"}),
	}
});

export const responseData = mysqlTable("response_data", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	responseId: int("response_id", { unsigned: true }).notNull().references(() => responses.id, { onDelete: "cascade" } ),
	formFieldId: int("form_field_id", { unsigned: true }).notNull().references(() => formFields.id, { onDelete: "cascade" } ),
	value: text("value"),
},
(table) => {
	return {
		responseId: index("response_id").on(table.responseId),
		formFieldId: index("form_field_id").on(table.formFieldId),
		responseDataId: primaryKey({ columns: [table.id], name: "response_data_id"}),
	}
});

export const responses = mysqlTable("responses", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	formId: int("form_id", { unsigned: true }).notNull().references(() => forms.id, { onDelete: "cascade" } ),
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		formId: index("form_id").on(table.formId),
		responsesId: primaryKey({ columns: [table.id], name: "responses_id"}),
		userId: unique("user_id").on(table.userId),
	}
});

export const sessions = mysqlTable("sessions", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id),
	token: varchar("token", { length: 255 }).notNull(),
	isValid: tinyint("is_valid").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		tokenIdx: index("token_index").on(table.token),
		sessionsId: primaryKey({ columns: [table.id], name: "sessions_id"}),
		token: unique("token").on(table.token),
	}
});

export const sysLogs = mysqlTable("sys_logs", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	type: varchar("type", { length: 10 }).notNull(),
	message: text("message").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		sysLogsId: primaryKey({ columns: [table.id], name: "sys_logs_id"}),
	}
});

export const users = mysqlTable("users", {
	id: int("id", { unsigned: true }).autoincrement().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
	salt: varchar("salt", { length: 255 }).notNull(),
	isDeleted: tinyint("is_deleted"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		usersId: primaryKey({ columns: [table.id], name: "users_id"}),
		email: unique("email").on(table.email),
	}
});