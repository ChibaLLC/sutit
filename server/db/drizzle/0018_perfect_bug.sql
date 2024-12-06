ALTER TABLE "payments" ADD COLUMN "receipt_number" varchar(255);--> statement-breakpoint
ALTER TABLE "prepaid_forms" ADD COLUMN "group_form_response_id" integer;--> statement-breakpoint
ALTER TABLE "prepaid_forms" ADD COLUMN "form_response_id" integer;--> statement-breakpoint
ALTER TABLE "prepaid_forms" ADD COLUMN "user" jsonb;