import type { Stores, Pages } from "@chiballc/nuxt-form-builder";

export type SutitFormData = {
	name: string;
	description: string | null | undefined;
	allowGroups: boolean;
	requireMerch: boolean;
	form: {
		stores: Stores;
		pages: Pages;
	};
	payment: {
		amount: number | null | undefined;
		group_amount: number | null | undefined;
		group_limit: number | null | undefined;
		group_message: string | null;
		group_invite_message: string | null;
	};
};
