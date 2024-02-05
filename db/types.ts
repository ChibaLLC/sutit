import {users, forms, formFields, responses, responseData, sessions} from "./drizzle/schema"

export namespace Drizzle {
    export namespace User {
        export type insert = typeof users.$inferInsert
        export type select = typeof users.$inferSelect
    }

    export namespace Form {
        export type insert = typeof forms.$inferInsert
        export type select = typeof forms.$inferSelect
    }

    export namespace FormFields {
        export type insert = typeof formFields.$inferInsert
        export type select = typeof formFields.$inferSelect
    }

    export namespace Responses {
        export type insert = typeof responses.$inferInsert
        export type select = typeof responses.$inferSelect
    }

    export namespace ResponseData {
        export type insert = typeof responseData.$inferInsert
        export type select = typeof responseData.$inferSelect
    }

    export namespace Session {
        export type insert = typeof sessions.$inferInsert
        export type select = typeof sessions.$inferSelect
    }
}