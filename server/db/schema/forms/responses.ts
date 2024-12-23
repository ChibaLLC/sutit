import { eq } from "drizzle-orm";
import { pgTable, timestamp, varchar, text, pgView, QueryBuilder, integer, boolean } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { formFields, formGroups, formMeta, formPages } from "./forms";
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
	pricePaid: integer("price_paid").notNull().default(0),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const itemResponses = pgTable("store_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	itemUlid: varchar("store_ulid", { length: 255 })
		.notNull()
		.references(() => storeItems.ulid, { onDelete: "cascade" }),
	liked: boolean("liked").default(false),
	carted: boolean("carted").default(false),
	value: text("value"),
	storeResponseUlid: varchar("form_response_ulid")
		.references(() => storeResponses.ulid, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

const qb = new QueryBuilder();
const form_elements = qb
	.select({
		formUlid: formPages.formUlid,
		fieldUlid: formFields.ulid,
	})
	.from(formPages)
	.innerJoin(formFields, eq(formPages.ulid, formFields.pageUlid))
	.groupBy(formPages.formUlid, formFields.pageUlid)
	.as("form_elements");
const store_items = qb
	.select({
		formUlid: _stores.formUlid,
		itemUlid: storeItems.ulid,
		likes: storeItems.likes,
	})
	.from(_stores)
	.innerJoin(storeItems, eq(_stores.ulid, storeItems.ulid))
	.groupBy(_stores.formUlid, storeItems.storeUlid)
	.as("store_items");

const form_field_responses = qb
	.select({
		formResponseUlid: formFieldResponses.formResponseUlid,
		fieldUlid: form_elements.fieldUlid,
		value: formFieldResponses.value,
		
		formUlid: form_elements.formUlid,
	})
	.from(formFieldResponses)
	.innerJoin(form_elements, eq(formFieldResponses.fieldUlid, form_elements.fieldUlid))
	.as("form_field_responses");

export const formResponsesView = pgView("form_responses_view").as(
	qb
		.select({
			responseUlid: formResponses.ulid,
			fieldUlid: form_field_responses.fieldUlid,
			formUlid: form_field_responses.formUlid,
			value: form_field_responses.value,
			pricePaid: formResponses.pricePaid,
			date: formResponses.createdAt
		})
		.from(formResponses)
		.innerJoin(form_field_responses, eq(formResponses.ulid, form_field_responses.formResponseUlid))
);

const store_items_responses = qb
	.select({
		storeResponseUlid: itemResponses.storeResponseUlid,
		itemUlid: store_items.itemUlid,
		value: itemResponses.value,
		formUlid: store_items.formUlid,
	})
	.from(itemResponses)
	.innerJoin(store_items, eq(itemResponses.itemUlid, store_items.itemUlid))
	.as("store_items_responses");
export const storeResponsesView = pgView("store_responses_view").as(
	qb
		.select({
			responseUlid: storeResponses.ulid,
			itemUlid: store_items_responses.itemUlid,
			formUlid: store_items_responses.formUlid,
			value: store_items_responses.value,
			pricePaid: storeResponses.pricePaid,
			date: storeResponses.createdAt
		})
		.from(storeResponses)
		.innerJoin(store_items_responses, eq(storeResponses.ulid, store_items_responses.storeResponseUlid))
);
