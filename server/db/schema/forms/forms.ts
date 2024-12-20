import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { users } from "~~/server/db/schema/users";
import { stores } from "./stores";

export const forms = pgTable("forms", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formName: varchar("form_name", { length: 255 }).notNull(),
	formDescription: text("form_description"),
	userUlid: varchar("user_ulid", { length: 255 })
		.notNull()
		.references(() => users.ulid, { onDelete: "cascade" }),
	store: varchar("formStore", { length: 255 }).references(() => stores.ulid, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const formMeta = pgTable("forms_meta", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("formUlid", { length: 255 }).references(() => forms.ulid, {
		onDelete: "cascade",
	}),
	price_individual: integer("price_individual").default(0).notNull(),
	price_group: integer("price_group_amount").default(0).notNull(),
	group_member_count: integer("price_group_count").default(0),
	group_invite_message: text("price_group_message"),
	allowGroups: boolean("allow_groups").default(false),
});

export const formFieldInputType = pgEnum("input_type", [
	"text",
	"password",
	"email",
	"number",
	"date",
	"url",
	"tel",
	"search",
	"file",
	"image",
	"checkbox",
	"radio",
	"select",
	"button",
	"static",
	"textarea",
	"richtext",
	"store",
]);

export const formFields = pgTable("form_fields", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("form_ulid").references(() => forms.ulid, { onDelete: "cascade" }),
	label: varchar("label", { length: 255 }).notNull(),
	inputType: varchar("input_type", { enum: formFieldInputType.enumValues }).notNull(),
	index: integer("index").notNull(),
	page: varchar("page", { length: 255 }).notNull(),
	description: text("description"),
	placeholder: varchar("placeholder", { length: 255 }),
	options: jsonb("options"),
	accept: varchar("accept", { length: 255 }),
	type: varchar("type"),
});

export const formGroups = pgTable("form_groups", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	groupName: varchar("group_name", { length: 255 }).notNull(),
	invites: jsonb("invites"),
	paymentUlid: varchar("payment_ulid", { length: 255 }),
	formUlid: varchar("form_ulid", { length: 255 }),
});
