import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export const stores = pgTable("stores", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const storeItems = pgTable("store_items", {
	ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	storeUlid: varchar("store_ulid", { length: 255 }).references(() => stores.ulid, {
		onDelete: "cascade",
	}),
});
