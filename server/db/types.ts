import {
	formPayments,
	formResponses,
	formFields,
	forms,
	payments,
	sessions,
	storePayments,
	storeResponses,
	stores,
	users,
	withdrawals,
	formGroupResponses,
	formGroups,
	storeItems
} from "./schema";

export namespace Drizzle {
	export namespace User {
		export type insert = typeof users.$inferInsert;
		export type select = typeof users.$inferSelect;
	}

	export namespace Form {
		export type insert = typeof forms.$inferInsert;
		export type select = typeof forms.$inferSelect;
	}

	export namespace FormResponses {
		export type insert = typeof formResponses.$inferInsert;
		export type select = typeof formResponses.$inferSelect;
	}

	export namespace StoreResponses {
		export type insert = typeof storeResponses.$inferInsert;
		export type select = typeof storeResponses.$inferSelect;
	}

	export namespace Session {
		export type insert = typeof sessions.$inferInsert;
		export type select = typeof sessions.$inferSelect;
	}

	export namespace FormPayment {
		export type insert = typeof formPayments.$inferInsert;
		export type select = typeof formPayments.$inferSelect;
	}

	export namespace Payment {
		export type insert = typeof payments.$inferInsert;
		export type select = typeof payments.$inferSelect;
	}

	export namespace Store {
		export type insert = typeof stores.$inferInsert;
		export type select = typeof stores.$inferSelect;
	}

	export namespace StorePayment {
		export type insert = typeof storePayments.$inferInsert;
		export type select = typeof storePayments.$inferSelect;
	}

	export namespace Withdrawals {
		export type insert = typeof withdrawals.$inferInsert;
		export type select = typeof withdrawals.$inferSelect;
	}

	export namespace FormGroups {
		export type insert = typeof formGroups.$inferInsert;
		export type select = typeof formGroups.$inferSelect;
	}

	export namespace FormGroupResponses {
		export type insert = typeof formGroupResponses.$inferInsert;
		export type select = typeof formGroupResponses.$inferSelect;
	}
	export namespace FormFields {
		export type insert = typeof formFields.$inferInsert;
		export type select = typeof formFields.$inferInsert;
	}
	export namespace StoreItems {
		export type insert = typeof storeItems.$inferInsert;
		export type select = typeof storeItems.$inferInsert;
	}
}
