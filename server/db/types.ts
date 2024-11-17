import { users, forms, formResponses, storeResponses, sessions, formPayments, payments, stores, storePayments, withDrawals, prepaidForms, groupFormResponses } from "./drizzle/schema"

export namespace Drizzle {
    export namespace User {
        export type insert = typeof users.$inferInsert
        export type select = typeof users.$inferSelect
    }

    export namespace Form {
        export type insert = typeof forms.$inferInsert
        export type select = typeof forms.$inferSelect
    }

    export namespace FormResponses {
        export type insert = typeof formResponses.$inferInsert
        export type select = typeof formResponses.$inferSelect
    }

    export namespace StoreResponses {
        export type insert = typeof storeResponses.$inferInsert
        export type select = typeof storeResponses.$inferSelect
    }

    export namespace Session {
        export type insert = typeof sessions.$inferInsert
        export type select = typeof sessions.$inferSelect
    }

    export namespace FormPayment {
        export type insert = typeof formPayments.$inferInsert
        export type select = typeof formPayments.$inferSelect
    }

    export namespace Payment {
        export type insert = typeof payments.$inferInsert
        export type select = typeof payments.$inferSelect
    }

    export namespace Store {
        export type insert = typeof stores.$inferInsert
        export type select = typeof stores.$inferSelect
    }

    export namespace StorePayment {
        export type insert = typeof storePayments.$inferInsert
        export type select = typeof storePayments.$inferSelect
    }

    export namespace WithDrawals {
        export type insert = typeof withDrawals.$inferInsert
        export type select = typeof withDrawals.$inferSelect
    }

    export namespace PrepaidForms {
        export type insert = typeof prepaidForms.$inferInsert
        export type select = typeof prepaidForms.$inferSelect
    }

    export namespace GroupFormResponses {
        export type insert = typeof groupFormResponses.$inferInsert
        export type select = typeof groupFormResponses.$inferSelect
    }
}