import type { form, user, response, store, order, session, payment, withdrawal, stores } from "./schema";

export namespace Drizzle {
  export namespace User {
    export type insert = typeof user.$inferInsert;
    export type select = typeof user.$inferSelect;
  }

  export namespace FormResponses {
    export type insert = typeof response.$inferInsert;
    export type select = typeof response.$inferSelect;
  }

  export namespace StoreResponses {
    export type insert = typeof order.$inferInsert;
    export type select = typeof order.$inferSelect;
  }
  export namespace Session {
    export type insert = typeof session.$inferInsert;
    export type select = typeof session.$inferSelect;
  }

  export namespace Payment {
    export type insert = typeof payment.$inferInsert;
    export type select = typeof payment.$inferSelect;
  }

  export namespace Store {
    export type insert = typeof store.$inferInsert;
    export type select = typeof store.$inferSelect;
  }
  export namespace Withdrawals {
    export type insert = typeof withdrawal.$inferInsert;
    export type select = typeof withdrawal.$inferSelect;
  }

  export type SutitForm = typeof form.$inferSelect;
  export type SutitStore = typeof stores.$inferSelect;
}
