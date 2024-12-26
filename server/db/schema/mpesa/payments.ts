import {integer, pgTable, timestamp, unique, varchar} from "drizzle-orm/pg-core";
import {ulid} from "ulid";
import {v4} from "uuid";

export const payments = pgTable(
    "payments",
    {
        ulid: varchar("ulid", { length: 255 }).primaryKey().$defaultFn(ulid).notNull(),
        referenceCode: varchar("reference_code", { length: 30 }).notNull(),
        phoneNumber: varchar("phone_number", { length: 30 }).notNull(),
        amount: integer("amount").notNull(),
        receiptNumber: varchar("receipt_number", { length: 255 }).$defaultFn(v4),
        createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    },
    (table) => {
        return {
            paymentsReferenceCodeKey: unique("payments_reference_code_key").on(table.referenceCode),
        };
    }
);