import { pgTable, timestamp, varchar, integer, jsonb, pgView } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { eq } from "drizzle-orm";

export const stores = pgTable("stores", {
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
export const storeItems = pgTable("store_items", {
  ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
  meta: jsonb("meta").$type<StoreItem>(),
  stock: integer("stock").default(0),
  price: integer("price").notNull(),
  likes: integer("likes").default(0),
  storeUlid: varchar("store_ulid", { length: 255 }).references(() => stores.ulid, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const storesView = pgView("stores_with_items").as((db) =>
  db
    .select({  
      storeUlid: stores.ulid,
      storeIndex: stores.index,
      storeCreatedAt: stores.createdAt,
      storeUpdatedAt: stores.updatedAt,
      itemUlid: storeItems.ulid,
      itemMeta: storeItems.meta,
      itemStock: storeItems.stock,
      itemPrice: storeItems.price,
      itemLikes: storeItems.likes,
      itemCreatedAt: storeItems.createdAt,
      itemUpdatedAt: storeItems.updatedAt,
    })
    .from(stores)
    .leftJoin(storeItems, eq(stores.ulid, storeItems.storeUlid))
);
