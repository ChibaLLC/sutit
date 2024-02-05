import {users, messages} from "./schema"

export namespace Drizzle {
    export namespace User {
        export type insert = typeof users.$inferInsert
        export type select = typeof users.$inferSelect
    }

    export namespace Message {
        export type insert = typeof messages.$inferInsert
        export type select = typeof messages.$inferSelect
    }
}