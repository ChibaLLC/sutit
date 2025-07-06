import type { forms, users, response, stores, order, sessions, payments, withdrawals, storesView } from "./schema";

export namespace Drizzle {
  export namespace User {
    export type insert = typeof users.$inferInsert;
    export type select = typeof users.$inferSelect;
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
    export type insert = typeof sessions.$inferInsert;
    export type select = typeof sessions.$inferSelect;
  }

  export namespace Payment {
    export type insert = typeof payments.$inferInsert;
    export type select = typeof payments.$inferSelect;
  }

  export namespace Store {
    export type insert = typeof stores.$inferInsert;
    export type select = typeof stores.$inferSelect;
  }

  export namespace Withdrawals {
    export type insert = typeof withdrawals.$inferInsert;
    export type select = typeof withdrawals.$inferSelect;
  }

  export type SutitForm = typeof forms.$inferSelect;
  export type SutitStore = typeof storesView.$inferSelect;
}
