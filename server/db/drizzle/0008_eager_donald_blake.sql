ALTER TABLE "prepaid_forms" ALTER COLUMN "form_ulid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prepaid_forms" ALTER COLUMN "token" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "prepaid_forms" ADD COLUMN "is_valid" boolean DEFAULT true;