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
  layout: z.union([z.literal("vertical"), z.literal("horizontal"), z.literal("inline")]).optional(),
  spacing: z.union([z.literal("tight"), z.literal("normal"), z.literal("loose")]).optional(),
  theme: z.union([z.literal("light"), z.literal("dark"), z.literal("auto")]).optional(),
});

export const storeItemSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.union([z.number(), z.string()]),
  quantity: z.number().optional(),
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
  items: z.array(storeItemSchema).min(1, "At least on store item should be set"),
});

export const eventSchemaSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  slug: z.string().min(1, "Event slug is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  timezone: z.string().optional().default("UTC"),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueMapUrl: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  category: z.string().optional(),
  audience: z.string().optional(),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean().optional().default(false),
  isFree: z.boolean().optional().default(true),
  refundPolicy: z.string().optional(),
  status: z.string().optional().default("upcoming"),
  publishedAt: z.string().optional().nullable(),
});

export const formSchemaSchema = z.object({
  id: z.string().optional(),
  createdBy: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  pages: z.array(pageSchemaSchema).min(1, "At least one page is required"),
  stores: z.array(storeSchema).optional().nullable(),
  price: z.union([z.number(), z.string()]),
  status: z.string().min(1, "Status is required"),
  requireMerch: z.boolean(),
  allowGroups: z.boolean(),
  calculateTat: z.boolean(),
  groupAmountPayable: z.union([z.number(), z.string()]).optional(),
  groupMemberLimit: z.number().optional(),
  infoPromptMessage: z.string().optional(),
  allowMultipleSubmissions: z.boolean(),
  allowRegistrationReuse: z.boolean(),
  submissionLimit: z.number().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  tags: z.array(z.string()),
  isPublic: z.boolean(),
  requiresLogin: z.boolean(),
  requirePassword: z.boolean().optional(),
  password: z.string().optional().nullable(),
  acceptResponses: z.boolean().default(true),
  expiresAt: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug is required"),
  afterSubmissionMessage: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  hasEvent: z.boolean().optional().default(false),
  event: eventSchemaSchema.optional().nullable(),
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
