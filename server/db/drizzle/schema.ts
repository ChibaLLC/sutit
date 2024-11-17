import { pgTable, unique, varchar, boolean, timestamp, index, integer, text, jsonb, serial, primaryKey } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().notNull(),
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
	ulid: varchar("ulid", { length: 255 }).primaryKey().notNull(),
	userUlid: varchar("user_ulid", { length: 255 }).notNull().references(() => users.ulid, { onDelete: "cascade" }),
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

export const payments = pgTable("payments", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().notNull(),
	referenceCode: varchar("reference_code", { length: 30 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 30 }).notNull(),
	amount: integer("amount").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
	(table) => {
		return {
			paymentsReferenceCodeKey: unique("payments_reference_code_key").on(table.referenceCode),
		}
	});

export const forms = pgTable("forms", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().notNull(),
	formName: varchar("form_name", { length: 255 }).notNull(),
	formDescription: text("form_description"),
	pages: jsonb("pages").notNull(),
	price_individual: integer("price_individual").default(0).notNull(),
	price_group_amount: integer("price_group_amount").default(0).notNull(),
	price_group_count: integer("price_group_count").default(0),
	withDrawnFunds: integer("withdrawn_funds").default(0).notNull(),
	allowGroups: boolean("allow_groups").default(false),
	userUlid: varchar("user_ulid", { length: 255 }).notNull().references(() => users.ulid, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const prepaidForms = pgTable("prepaid_forms", {
	id: serial("id").primaryKey(),
	formUlid: varchar("form_ulid", { length: 255 }).notNull(),
	paymentUlid: varchar("payment_ulid", { length: 255 }),
	token: varchar("token", { length: 255 }).notNull(),
	isValid: boolean("is_valid").default(true)
})

export const groupFormResponses = pgTable("group_form_responses", {
	id: serial("id").primaryKey(),
	groupName: varchar("group_name", { length: 255 }).notNull(),
	invites: jsonb("invites"),
	paymentUlid: varchar("payment_ulid", { length: 255 }).references(() => payments.ulid, { onDelete: "no action" }).notNull(),
	formUlid: varchar("form_ulid", { length: 255 }).references(() => forms.ulid, { onDelete: "no action" }).notNull()
})

export const stores = pgTable("stores", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().notNull(),
	formUlid: varchar("form_ulid", { length: 255 }).notNull().references(() => forms.ulid, { onDelete: "cascade" }),
	store: jsonb("store").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const sysLogs = pgTable("sys_logs", {
	id: serial("id").primaryKey().notNull(),
	level: varchar("level", { length: 10 }).notNull(),
	message: text("message").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const formPayments = pgTable("form_payments", {
	formUlid: varchar("form_ulid", { length: 255 }).notNull().references(() => forms.ulid, { onDelete: "no action" }),
	paymentUlid: varchar("payment_ulid", { length: 255 }).notNull().references(() => payments.ulid, { onDelete: "no action" }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
	(table) => {
		return {
			formPaymentsPkey: primaryKey({ columns: [table.formUlid, table.paymentUlid], name: "form_payments_pkey" })
		}
	});

export const storePayments = pgTable("store_payments", {
	storeUlid: varchar("store_ulid", { length: 255 }).notNull().references(() => stores.ulid, { onDelete: "no action" }),
	paymentUlid: varchar("payment_ulid", { length: 255 }).notNull().references(() => payments.ulid, { onDelete: "no action" }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
	(table) => {
		return {
			storePaymentsPkey: primaryKey({ columns: [table.storeUlid, table.paymentUlid], name: "store_payments_pkey" })
		}
	});

export const formResponses = pgTable("form_responses", {
	id: serial("id").primaryKey().notNull(),
	formUlid: varchar("form_ulid", { length: 255 }).notNull().references(() => forms.ulid, { onDelete: "cascade" }),
	response: jsonb("response").notNull(),
	price: integer("price"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const storeResponses = pgTable("store_responses", {
	id: serial("id").primaryKey().notNull(),
	storeUlid: varchar("store_ulid", { length: 255 }).notNull().references(() => stores.ulid, { onDelete: "cascade" }),
	response: jsonb("response"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});


export const withDrawals = pgTable("with_drawals", {
	id: serial("id").primaryKey().notNull(),
	amount: integer("amount").notNull(),
	transactionCode: varchar("transaction_code", { length: 30 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});