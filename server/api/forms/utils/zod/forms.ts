import type { Form } from "@chiballc/nuxt-form-builder";
import { z } from "zod";

export const formBodyData = z.object({
	name: z.string(),
	description: z.string().nullable().optional(),
	allowGroups: z.boolean(),
	requireMerch: z.boolean(),
	form: z.custom<Form>((data) => data && typeof data === "object"),
	payment: z.object({
		amount: z.number().nullable().optional(),
		group_amount: z.number().nullable().optional(),
		group_limit: z.number().nullable().optional(),
		group_message: z.string(),
		group_invite_message: z.string(),
	}),
});
