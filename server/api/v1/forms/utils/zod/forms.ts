import { z } from "zod";

export const formCreateSchema = z.object({
	name: z.string(),
	description: z.string().nullable().optional(),
	allowGroups: z.boolean(),
	requireMerch: z.boolean(),
	form: FormSchema,
	payment: z.object({
		amount: z.number().nullable().optional(),
		group_amount: z.number().nullable().optional(),
		group_limit: z.number().nullable().optional(),
		group_message: z.string(),
	}),
});

export const formUpdateSchema = formCreateSchema.extend({
	ulid: z.string(),
});
