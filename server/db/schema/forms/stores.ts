import { pgTable, timestamp, varchar, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { formMeta } from "./forms";

export const stores = pgTable("stores", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	formUlid: varchar("form_ulid").references(() => formMeta.ulid, {
		onDelete: "cascade",
	}),
	index: varchar("index", { length: 255 }).notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storeItems = pgTable("store_items", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	index: varchar("index", { length: 255 }).notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	stock: integer("stock").notNull(),
	price: integer("price").notNull(),
	likes: integer("likes").default(0),
	images: jsonb("images").notNull().$type<string[]>(),
	isInfinite: boolean("is_infinite").default(false),
	storeUlid: varchar("store_ulid", { length: 255 }).references(() => stores.ulid, {
		onDelete: "cascade",
	}),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
