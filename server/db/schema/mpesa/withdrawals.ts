import {integer, pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";
import {ulid} from "ulid"
export const withdrawals = pgTable("withdrawals", {
    ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
    amount: integer("amount").notNull(),
    transactionCode: varchar("transaction_code", { length: 30 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
