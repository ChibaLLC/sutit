import {
	boolean,
	integer,
	jsonb,
	QueryBuilder,
	pgTable,
	text,
	timestamp,
	varchar,
	pgView,
	unique,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { users } from "../users";
import { storeItems, stores } from "./stores";
import { eq, sql } from "drizzle-orm";

export const formMeta = pgTable("form_meta", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formName: varchar("form_name", { length: 255 }).notNull(),
	formDescription: text("form_description"),
	userUlid: varchar("user_ulid", { length: 255 })
		.notNull()
		.references(() => users.ulid, { onDelete: "cascade" }),
	price_individual: integer("price_individual").default(0).notNull(),
	price_group: integer("price_group_amount").default(0).notNull(),
	group_member_count: integer("group_member_count").default(0),
	group_invite_message: text("group_invite_message"),
	allowGroups: boolean("allow_groups").default(false),
	requireMerch: boolean("require_merch").default(false),
	withdrawnFunds: integer("withdrawn_funds").default(0),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const formPages = pgTable("form_pages", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("form_ulid").references(() => formMeta.ulid, {
		onDelete: "cascade",
	}),
	index: varchar("index", { length: 255 }).notNull(),
});

export const formFields = pgTable("form_fields", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	label: varchar("label", { length: 255 }).notNull(),
	inputType: varchar("input_type", { length: 40 }).notNull(),
	index: integer("index").notNull(),
	description: text("description"),
	placeholder: varchar("placeholder", { length: 255 }),
	options: jsonb("options"),
	accept: varchar("accept", { length: 255 }),
	type: varchar("type"),
	pageUlid: varchar("page", { length: 255 }).references(() => formPages.ulid, {
		onDelete: "cascade",
	}),
});

export type PhoneInvite = { phone: string };
export type EmailInvite = { email: string };
export type FormGroupInvite = Array<{ token: string; isValid: boolean } & (PhoneInvite | EmailInvite)>;
export const formGroups = pgTable(
	"form_groups",
	{
		ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
		groupName: varchar("group_name", { length: 255 }).notNull(),
		invites: jsonb("invites").$type<FormGroupInvite>(),
		paymentUlid: varchar("payment_ulid", { length: 255 }),
		formUlid: varchar("form_ulid", { length: 255 }).notNull(),
	},
	(table) => ({
		uniqueGroupNameAndFormUlid: unique().on(table.groupName, table.formUlid).nullsNotDistinct(),
	})
);

const qb = new QueryBuilder();
const form_elements = qb
	.select({
		fieldUlid: sql<string>`${formFields.ulid}`.as("form_field_ulid"),
		formUlid: sql<string>`${formPages.ulid}`.as("form_pages_ulid"),
		label: formFields.label,
		inputType: formFields.inputType,
		index: sql<number>`${formFields.index}`.as("form_fields_index"),
		description: formFields.description,
		placeholder: formFields.placeholder,
		options: formFields.options,
		accept: formFields.accept,
		type: formFields.type,
		page_index: sql`${formPages.index}`.as("form_pages_index"),
	})
	.from(formPages)
	.innerJoin(formFields, eq(formFields.pageUlid, formPages.ulid))
	.as("form_elements");
const store_items = qb
	.select({
		itemUlid: sql<string>`store_items.ulid`.as("item_ulid"),
		storeUlid: sql<string>`stores.ulid`.as("stores_ulid"),
		formUlid: stores.formUlid,
		index: sql<number>`${storeItems.index}`.as("store_items_index"),
		name: storeItems.name,
		qtty: storeItems.qtty,
		price: storeItems.price,
		likes: storeItems.likes,
		images: storeItems.images,
		store_index: sql`${stores.index}`.as("stores_index"),
	})
	.from(stores)
	.innerJoin(storeItems, eq(stores.ulid, storeItems.storeUlid))
	.as("store_items");

export const sutitForms = pgView("sutit_forms").as(
	qb
		.select()
		.from(formMeta)
		.innerJoin(form_elements, eq(formMeta.ulid, form_elements.formUlid))
		.innerJoin(store_items, eq(formMeta.ulid, store_items.formUlid))
);
