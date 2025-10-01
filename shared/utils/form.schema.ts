import { z } from "zod/v3";

export const fieldOptionSchema = z.object({
	label: z.string(),
	value: z.union([z.string(), z.number()]),
});

export const validationRuleSchema = z.object({
	type: z.union([
		z.literal("required"),
		z.literal("min"),
		z.literal("max"),
		z.literal("pattern"),
		z.literal("custom"),
	]),
	value: z.union([z.string(), z.number()]).optional(),
	message: z.string(),
});

export const formSettingsSchema = z.object({
	submitText: z.string().optional(),
	resetText: z.string().optional(),
	layout: z
		.union([
			z.literal("vertical"),
			z.literal("horizontal"),
			z.literal("inline"),
		])
		.optional(),
	spacing: z
		.union([z.literal("tight"), z.literal("normal"), z.literal("loose")])
		.optional(),
	theme: z
		.union([z.literal("light"), z.literal("dark"), z.literal("auto")])
		.optional(),
});

export const storeItemSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	price: z.number(),
	quantity: z.number(),
	infinite: z.boolean().optional().nullable(),
	images: z.array(z.string()),
});

export const formFieldSchema = z.record(z.any()).and(
	z.object({
		type: z.string(),
		label: z.string(),
		name: z.string(),
		placeholder: z.string().optional(),
		required: z.boolean().optional(),
		validation: z.array(validationRuleSchema).optional(),
		options: z.array(z.string()).optional(),
		orderIndex: z.number(),
	}),
);

export const pageSchemaSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	fields: z.array(formFieldSchema).min(1, "A field is required"),
	orderIndex: z.number(),
});

export const dragItemSchema = z.object({
	type: z.string(),
	field: formFieldSchema.optional(),
	fromIndex: z.number().optional(),
});

export const storeSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
	items: z
		.array(storeItemSchema)
		.min(1, "At least on store item should be set"),
});

export const formSchemaSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	pages: z.array(pageSchemaSchema).min(1, "At least one page is required"),
	stores: z.array(storeSchema).optional().nullable(),
	price: z.number(),
	status: z.string().min(1, "Status is required"),
	requireMerch: z.boolean(),
	allowGroups: z.boolean(),
	calculateTat: z.boolean(),
	groupAmountPayable: z.number().optional(),
	groupMemberLimit: z.number().optional(),
	infoPromptMessage: z.string().optional(),
	allowMultipleSubmissions: z.boolean(),
	allowRegistrationReuse: z.boolean(),
	submissionLimit: z.number().optional().nullable(),
	publishedAt: z.string().default(new Date().toString()),
	tags: z.array(z.string()),
	isPublic: z.boolean(),
	requiresLogin: z.boolean(),
	slug: z.string().min(1, "Slug is required"),
});
export const slugify = (str: string) => {
	return str
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
};
