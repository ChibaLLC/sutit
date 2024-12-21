import { boolean, integer, jsonb, QueryBuilder, pgTable, text, timestamp, varchar, pgView, unique } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { users } from "~~/server/db/schema/users";
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
	group_member_count: integer("price_group_count").default(0),
	group_invite_message: text("price_group_message"),
	allowGroups: boolean("allow_groups").default(false),
	withdrawnFunds: integer("price_group_count").default(0),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const formPages = pgTable("form_pages", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("form_ulid").references(() => formMeta.ulid, {
		onDelete: "cascade",
	}),
	index: varchar("index", { length: 255 }),
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
	page: varchar("page", { length: 255 }).references(() => formPages.ulid, {
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
		uniqueGroupNameAndFormUlid: unique().on(table.groupName, table.formUlid).nullsNotDistinct()
	})
);

const qb = new QueryBuilder();
export const sutitForms = pgView("sutit_forms").as(
	qb
		.select()
		.from(formMeta)
		.innerJoin(
			qb
				.select({
					formUlid: formPages.ulid,
					label: formFields.label,
					inputType: formFields.inputType,
					index: formFields.index,
					description: formFields.description,
					placeholder: formFields.placeholder,
					options: formFields.options,
					accept: formFields.accept,
					type: formFields.type,
					page_index: formPages.index,
				})
				.from(formPages)
				.innerJoin(formFields, eq(formFields.page, formPages.ulid))
				.groupBy(formPages.index)
				.as("form_pages"),
			sql`${formMeta.ulid} = form_pages.form_ulid`
		)
		.innerJoin(
			qb
				.select({
					storeUlid: stores.ulid,
					formUlid: stores.formUlid,
					store: stores.index,
					index: storeItems.index,
					name: storeItems.name,
					quantity: storeItems.quantity,
					price: storeItems.price,
					likes: storeItems.likes,
					images: storeItems.images,
					store_index: stores.index,
				})
				.from(stores)
				.where(eq(stores.formUlid, formMeta.ulid))
				.innerJoin(storeItems, eq(stores.ulid, storeItems.storeUlid))
				.groupBy(stores.index)
				.as("form_stores"),
			sql`${formMeta.ulid} = form_stores.form_ulid`
		)
		.groupBy(formMeta.userUlid)
);
