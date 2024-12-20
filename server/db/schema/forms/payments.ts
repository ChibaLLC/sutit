import {pgTable, primaryKey, timestamp, varchar} from "drizzle-orm/pg-core";
import {stores} from "~~/server/db/schema/forms/stores";
import {payments} from "~~/server/db/schema/mpesa/payments";
import {forms} from "~~/server/db/schema/forms/forms";

export const storePayments = pgTable(
    "store_payments",
    {
        storeUlid: varchar("store_ulid", {length: 255})
            .notNull()
            .references(() => stores.ulid, {onDelete: "no action"}),
        paymentUlid: varchar("payment_ulid", {length: 255})
            .notNull()
            .references(() => payments.ulid, {onDelete: "no action"}),
        createdAt: timestamp("created_at", {mode: "string"}).defaultNow().notNull(),
    },
    (table) => {
        return {
            storePaymentsPkey: primaryKey({
                columns: [table.storeUlid, table.paymentUlid],
                name: "store_payments_pkey",
            }),
        };
    }
);

export const formPayments = pgTable(
    "form_payments",
    {
        formUlid: varchar("form_ulid", { length: 255 })
            .notNull()
            .references(() => forms.ulid, { onDelete: "no action" }),
        paymentUlid: varchar("payment_ulid", { length: 255 })
            .notNull()
            .references(() => payments.ulid, { onDelete: "no action" }),
        createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    },
    (table) => {
        return {
            formPaymentsPkey: primaryKey({
                columns: [table.formUlid, table.paymentUlid],
                name: "form_payments_pkey",
            }),
        };
    }
);