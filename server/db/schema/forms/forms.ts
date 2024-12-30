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
import { eq, sql, isNotNull } from "drizzle-orm";

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
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const formPages = pgTable("form_pages", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("form_ulid").references(() => formMeta.ulid, {
		onDelete: "cascade",
	}),
	index: varchar("index", { length: 255 }).notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	createdAt: timestamp("created_at").defaultNow().notNull(),
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
	rules: jsonb("rules"),
	pageUlid: varchar("page", { length: 255 }).references(() => formPages.ulid, {
		onDelete: "cascade",
	}),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	createdAt: timestamp("created_at").defaultNow().notNull(),
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
		fieldUlid: sql<string>`${formFields.ulid}`.as("form_field_ulid") as unknown as typeof formFields.ulid,
		pageUlid: sql<string>`${formFields.pageUlid}`.as(
			"form_pages_page_ulid"
		) as unknown as typeof formFields.pageUlid,
		formUlid: sql<string>`${formPages.formUlid}`.as("form_pages_formUlid") as unknown as typeof formPages.index,
		label: formFields.label,
		inputType: formFields.inputType,
		index: sql<number>`${formFields.index}`.as("form_fields_index") as unknown as typeof formFields.index,
		description: formFields.description,
		placeholder: formFields.placeholder,
		options: formFields.options,
		accept: formFields.accept,
		type: formFields.type,
		rules: formFields.rules,
		page_index: sql<string>`${formPages.index}`.as("form_pages_index") as unknown as typeof formPages.index,
	})
	.from(formPages)
	.innerJoin(formFields, eq(formPages.ulid, formFields.pageUlid))
	.as("form_elements");
const store_items = qb
	.select({
		itemUlid: sql<string>`${storeItems.ulid}`.as("item_ulid") as unknown as typeof storeItems.ulid,
		storeUlid: sql<string>`${stores.ulid}`.as("stores_ulid") as unknown as typeof stores.ulid,
		formUlid: stores.formUlid,
		index: sql<number>`${storeItems.index}`.as("store_items_index") as unknown as typeof storeItems.index,
		name: storeItems.name,
		stock: storeItems.stock,
		price: storeItems.price,
		likes: storeItems.likes,
		images: storeItems.images,
		isInfinite: storeItems.isInfinite,
		store_index: sql<string>`${stores.index}`.as("stores_index") as unknown as typeof stores.index,
	})
	.from(stores)
	.innerJoin(storeItems, eq(stores.ulid, storeItems.storeUlid))
	.as("store_items");

export const sutitForms = pgView("sutit_forms").as(
	qb.select().from(formMeta).leftJoin(form_elements, eq(formMeta.ulid, form_elements.formUlid))
);

export const sutitStores = pgView("sutit_stores").as(
	qb.select().from(store_items).where(isNotNull(store_items.formUlid))
);
