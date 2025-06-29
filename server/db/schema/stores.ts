import { pgTable, timestamp, varchar, integer, jsonb, pgView } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { eq } from "drizzle-orm";

export const store = pgTable("stores", {
  ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
  index: varchar("index", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export interface StoreItem {
  name: string;
  index: number;
  images: string[];
}
export const storeItem = pgTable("store_items", {
  ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
  meta: jsonb("meta").$type<StoreItem>(),
  stock: integer("stock").default(0).notNull(),
  price: integer("price").notNull(),
  likes: integer("likes").default(0),
  storeUlid: varchar("store_ulid", { length: 255 }).references(() => store.ulid, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const stores = pgView("stores_with_items_view").as((db) =>
  db
    .select({
      storeUlid: store.ulid,
      storeIndex: store.index,
      storeCreatedAt: store.createdAt,
      storeUpdatedAt: store.updatedAt,
      itemUlid: storeItem.ulid,
      itemMeta: storeItem.meta,
      itemStock: storeItem.stock,
      itemPrice: storeItem.price,
      itemLikes: storeItem.likes,
      itemCreatedAt: storeItem.createdAt,
      itemUpdatedAt: storeItem.updatedAt,
    })
    .from(store)
    .leftJoin(storeItem, eq(store.ulid, storeItem.storeUlid))
);
