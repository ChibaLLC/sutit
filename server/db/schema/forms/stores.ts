import { pgTable, timestamp, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { formMeta } from "..";

export const stores = pgTable("stores", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("form_ulid").references(() => formMeta.ulid, {
		onDelete: "cascade",
	}),
	index: varchar("index", { length: 255 }),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const storeItems = pgTable("store_items", {
	store: varchar("store", { length: 255 }).notNull(),
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	index: integer("index"),
	name: varchar("store", { length: 255 }).notNull(),
	quantity: integer("quantity"),
	price: integer("price").notNull(),
	likes: integer("likes").default(0),
	images: jsonb("images"),
	storeUlid: varchar("store_ulid", { length: 255 }).references(() => stores.ulid, {
		onDelete: "cascade",
	}),
});
