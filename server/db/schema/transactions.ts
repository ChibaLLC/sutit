import { pgTable, varchar, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { v4 } from "uuid";
import { users } from "./users";

export type PaymentMethods = "M-Pesa";
export const payments = pgTable(
  "payments",
  {
    ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
    referenceCode: varchar("reference_code", { length: 30 }).notNull(),
    userUlid: varchar("ulid", { length: 255 })
      .references(() => users.ulid)
      .notNull(),
    method: varchar("method").$type<PaymentMethods>(),
    contact: varchar("contact", { length: 30 }).notNull().$type<Contact>(),
    amount: integer("amount").notNull(),
    receiptNumber: varchar("receipt_number", { length: 255 }).$defaultFn(v4),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [unique("payments_reference_code_key").on(table.referenceCode, table.method)]
);

export const withdrawals = pgTable("withdrawals", {
  ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
  amount: integer("amount").notNull(),
  userUlid: varchar("ulid", { length: 255 })
    .references(() => users.ulid)
    .notNull(),
  transactionCode: varchar("transaction_code", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
