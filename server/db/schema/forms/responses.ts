import { eq, sql } from "drizzle-orm";
import { pgTable, timestamp, varchar, text, pgView, QueryBuilder, integer, boolean } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { formFields, formGroups, formPages } from "./forms";
import { storeItems, stores as _stores } from "./stores";

export const formResponses = pgTable("form_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	pricePaid: integer("price_paid").notNull().default(0),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const formFieldResponses = pgTable("form_field_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	fieldUlid: varchar("field_ulid", { length: 255 })
		.notNull()
		.references(() => formFields.ulid, { onDelete: "cascade" }),
	value: text("value"),
	formResponseUlid: varchar("form_response_ulid")
		.references(() => formResponses.ulid, { onDelete: "cascade" })
		.notNull(),
});

export const formGroupResponses = pgTable("form_group_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("form_ulid", { length: 255 }).notNull(),
	formGroupUlid: varchar("form_group_ulid")
		.references(() => formGroups.ulid, { onDelete: "no action" })
		.notNull(),
	responseUlid: varchar("response_ulid", { length: 255 }).references(() => formResponses.ulid, {
		onDelete: "no action",
	}),
});

export const storeResponses = pgTable("store_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	// Add Form Response To Reference Form
	formResponseUlid: varchar("form_response_ulid")
		.references(() => formResponses.ulid, { onDelete: "cascade" })
		.notNull(),
	pricePaid: integer("price_paid").notNull().default(0),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const itemResponses = pgTable("item_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	itemUlid: varchar("item_ulid", { length: 255 })
		.notNull()
		.references(() => storeItems.ulid, { onDelete: "cascade" }),
	liked: boolean("liked").default(false),
	carted: boolean("carted").default(false),
	value: text("value"),
	qtty: integer("qtty").default(1),
	storeResponseUlid: varchar("store_response_ulid")
		.references(() => storeResponses.ulid, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

const qb = new QueryBuilder();

const form_elements = qb
	.select({
		formUlid: sql<string>`${formPages.formUlid}`.as("form_ulid"),
		fieldUlid: sql<string>`${formFields.ulid}`.as("fields_ulid"),
	})
	.from(formPages)
	.innerJoin(formFields, eq(formPages.ulid, formFields.pageUlid))
	.as("form_elements");

const store_items = qb
	.select({
		formUlid: sql<string>`${_stores.formUlid}`.as("store_form_ulid"),
		itemUlid: sql<string>`${storeItems.ulid}`.as("item_ulid_view"),
		likes: storeItems.likes,
	})
	.from(_stores)
	.innerJoin(storeItems, eq(_stores.ulid, storeItems.storeUlid))
	.as("store_items");

const form_field_responses = qb
	.select({
		formResponseUlid: sql<string>`${formFieldResponses.formResponseUlid}`.as("form_response_ulid"),
		fieldUlid: sql<string>`${form_elements.fieldUlid}`.as("form_field_ulid"),
		value: formFieldResponses.value,
		formUlid: sql<string>`${form_elements.formUlid}`.as("form_elements_ulid"),
	})
	.from(formFieldResponses)
	.innerJoin(form_elements, eq(formFieldResponses.fieldUlid, form_elements.fieldUlid))
	.as("form_field_responses");

const store_items_responses = qb
	.select({
		storeResponseUlid: sql<string>`${itemResponses.storeResponseUlid}`.as("store_response_ulid"),
		itemUlid: sql<string>`${store_items.itemUlid}`.as("store_item_ulid"),
		value: itemResponses.value,
		formUlid: sql<string>`${store_items.formUlid}`.as("store_items_ulid"),
		qtty: sql<string>`${itemResponses.qtty}`.as("qtty"),
	})
	.from(itemResponses)
	.innerJoin(store_items, eq(itemResponses.itemUlid, store_items.itemUlid))
	.as("store_items_responses");

export const formResponsesView = pgView("form_responses_view").as(
	qb
		.select({
			responseUlid: sql<string>`${formResponses.ulid}`.as("response_ulid"),
			fieldUlid: sql<string>`${form_field_responses.fieldUlid}`.as("response_field_ulid"),
			formUlid: sql<string>`${form_field_responses.formUlid}`.as("response_form_ulid"),
			value: form_field_responses.value,
			pricePaid: formResponses.pricePaid,
			date: formResponses.createdAt,
		})
		.from(formResponses)
		.leftJoin(form_field_responses, eq(formResponses.ulid, form_field_responses.formResponseUlid)),
);

export const storeResponsesView = pgView("store_responses_view").as(
	qb
		.select({
			responseUlid: sql<string>`${storeResponses.ulid}`.as("store_response_ulid"),
			itemUlid: sql<string>`${store_items_responses.itemUlid}`.as("store_response_item_ulid"),
			formUlid: sql<string>`${store_items_responses.formUlid}`.as("store_response_form_ulid"),
			formResponseUlid: storeResponses.formResponseUlid,
			qtty: store_items_responses.qtty,
			value: store_items_responses.value,
			pricePaid: storeResponses.pricePaid,
			date: storeResponses.createdAt,
		})
		.from(storeResponses)
		.leftJoin(store_items_responses, eq(storeResponses.ulid, store_items_responses.storeResponseUlid)),
);
