ALTER TABLE "form_fields" ALTER COLUMN "field_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."field_type";--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('text', 'textarea', 'number', 'email', 'phone', 'url', 'date', 'time', 'datetime', 'select', 'multiselect', 'radio', 'checkbox', 'toggle', 'file', 'image', 'signature', 'rating', 'scale', 'matrix', 'section', 'payment', 'hidden', 'calculated');--> statement-breakpoint
ALTER TABLE "form_fields" ALTER COLUMN "field_type" SET DATA TYPE "public"."field_type" USING "field_type"::"public"."field_type";