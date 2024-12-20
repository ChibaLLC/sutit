import {boolean, integer, jsonb, pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";
import {ulid} from "ulid";
import {formGroups, forms} from "~~/server/db/schema/forms/forms";
import {stores} from "~~/server/db/schema/forms/stores";

export const formResponses = pgTable("form_responses", {
    id: serial("id").primaryKey().notNull(),
    formUlid: varchar("form_ulid", {length: 255})
        .notNull()
        .references(() => forms.ulid, {onDelete: "cascade"}),
    response: jsonb("response").notNull(),
    price: integer("price"),
    createdAt: timestamp("created_at", {mode: "string"}).defaultNow().notNull(),
});

export const formGroupResponses = pgTable("form_group_responses", {
    ulid: varchar("ulid", {length: 255}).primaryKey().$defaultFn(ulid).notNull(),
    formUlid: varchar("form_ulid", {length: 255}).notNull(),
    paymentUlid: varchar("payment_ulid", {length: 255}),
    formGroupUlid: varchar("form_group_ulid").references(() => formGroups.ulid, {onDelete: "no action"}).notNull(),
    invite: jsonb("invite"),
    token: varchar("token", {length: 255}).notNull(),
    isValid: boolean("is_valid").default(true),
});

export const storeResponses = pgTable("store_responses", {
    id: serial("id").primaryKey().notNull(),
    storeUlid: varchar("store_ulid", { length: 255 })
        .notNull()
        .references(() => stores.ulid, { onDelete: "cascade" }),
    response: jsonb("response"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});