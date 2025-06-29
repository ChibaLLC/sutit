import { integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { form } from "./forms";
import type { JSONValue, Serializable } from "postgres";
import { ulid, type ULID } from "ulid";
import { payment } from "./transactions";

export type OrderItems = ULID[];
export const order = pgTable("orders", {
  ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
  items: jsonb().$type<OrderItems>(),
  amount: integer("amount").notNull().default(0),
  paymentUlid: varchar("ulid", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export interface FormResponse {
  label: string;
  value: Serializable | JSONValue | object;
}
export const response = pgTable("form_responses", {
  ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
  response: jsonb().$type<FormResponse>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  formUlid: varchar("form_ulid")
    .references(() => form.ulid)
    .notNull(),
  paymentUlid: varchar("ulid", { length: 255 }).references(() => payment.ulid),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
