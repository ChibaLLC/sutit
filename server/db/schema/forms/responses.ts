import { eq } from "drizzle-orm";
import { jsonb, pgTable, serial, timestamp, varchar, text, pgView, QueryBuilder, integer, boolean } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { formFields, formGroups, formPages, sutitForms } from "./forms";
import { storeItems, stores as _stores } from "./stores";

export const formResponses = pgTable("form_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	fieldUlid: varchar("field_ulid", { length: 255 })
		.notNull()
		.references(() => formFields.ulid, { onDelete: "cascade" }),
	value: text("value"),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const formGroupResponses = pgTable("form_group_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("form_ulid", { length: 255 }).notNull(),
	paymentUlid: varchar("payment_ulid", { length: 255 }),
	formGroupUlid: varchar("form_group_ulid")
		.references(() => formGroups.ulid, { onDelete: "no action" })
		.notNull(),
	responseUlid: varchar("response_ulid", { length: 255 }).references(() => formResponses.ulid, {
		onDelete: "no action",
	}),
});

export const storeResponses = pgTable("store_responses", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	itemUlid: varchar("store_ulid", { length: 255 })
		.notNull()
		.references(() => storeItems.ulid, { onDelete: "cascade" }),
	liked: boolean("liked").default(false),
	carted: boolean("carted").default(false),
	value: text("value"),
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
const stores_items = qb
	.select({
		formUlid: _stores.formUlid,
		itemUlid: storeItems.ulid,
		likes: storeItems.likes
	})
	.from(_stores)
	.innerJoin(storeItems, eq(_stores.ulid, storeItems.ulid))
	.groupBy(_stores.formUlid, storeItems.storeUlid)
	.as("store_items");

export const formResponsesView = pgView("form_responses_view").as(
	qb
		.select({
			responseUlid: formResponses.ulid,
			fieldUlid: form_elements.fieldUlid,
			formUlid: form_elements.formUlid,
			value: formResponses.value,
			date: formResponses.createdAt,
		})
		.from(formResponses)
		.innerJoin(form_elements, eq(formResponses.fieldUlid, form_elements.formUlid))
);

export const storeResponsesView = pgView("store_responses_view").as(
	qb
		.select({
			responseUlid: storeResponses.ulid,
			itemUlid: stores_items.itemUlid,
			formUlid: stores_items.formUlid,
			value: storeResponses.value,
			date: storeResponses.createdAt,
			liked: storeResponses.liked,
			carted: storeResponses.carted
		})
		.from(storeResponses)
		.innerJoin(stores_items, eq(storeResponses.itemUlid, stores_items.formUlid))
);
