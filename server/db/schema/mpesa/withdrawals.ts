import {integer, pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";

export const withdrawals = pgTable("withdrawals", {
    id: serial("id").primaryKey().notNull(),
    amount: integer("amount").notNull(),
    transactionCode: varchar("transaction_code", { length: 30 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
