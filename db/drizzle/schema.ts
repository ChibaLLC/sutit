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
	price: integer("price").notNull(),
	userUlid: varchar("user_ulid", { length: 255 }).notNull().references(() => users.ulid, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

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
	formUlid: varchar("form_ulid", { length: 255 }).notNull().references(() => forms.ulid, { onDelete: "cascade" }),
	paymentUlid: varchar("payment_ulid", { length: 255 }).notNull().references(() => payments.ulid, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
	(table) => {
		return {
			formPaymentsPkey: primaryKey({ columns: [table.formUlid, table.paymentUlid], name: "form_payments_pkey" })
		}
	});

export const storePayments = pgTable("store_payments", {
	storeUlid: varchar("store_ulid", { length: 255 }).notNull().references(() => stores.ulid, { onDelete: "cascade" }),
	paymentUlid: varchar("payment_ulid", { length: 255 }).notNull().references(() => payments.ulid, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
	(table) => {
		return {
			storePaymentsPkey: primaryKey({ columns: [table.storeUlid, table.paymentUlid], name: "store_payments_pkey" })
		}
	});

export const formResponses = pgTable("form_responses", {
	formUlid: varchar("form_ulid", { length: 255 }).notNull().references(() => forms.ulid, { onDelete: "cascade" }),
	userUlid: varchar("user_ulid", { length: 255 }).notNull().references(() => users.ulid, { onDelete: "cascade" }),
	response: jsonb("response").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
	(table) => {
		return {
			formResponsesPkey: primaryKey({ columns: [table.formUlid, table.userUlid], name: "form_responses_pkey" })
		}
	});

export const storeResponses = pgTable("store_responses", {
	storeUlid: varchar("store_ulid", { length: 255 }).notNull().references(() => stores.ulid, { onDelete: "cascade" }),
	userUlid: varchar("user_ulid", { length: 255 }).notNull().references(() => users.ulid, { onDelete: "cascade" }),
	response: jsonb("response"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
	(table) => {
		return {
			storeResponsesPkey: primaryKey({ columns: [table.storeUlid, table.userUlid], name: "store_responses_pkey" })
		}
	});