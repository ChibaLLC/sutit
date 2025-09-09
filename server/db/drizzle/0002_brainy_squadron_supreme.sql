ALTER TABLE "form_payments" DROP CONSTRAINT "form_payments_pkey";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "reference_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "form_payments" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "form_payments" ADD COLUMN "submission_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "form_payment_submission_idx" ON "form_payments" USING btree ("submission_id");