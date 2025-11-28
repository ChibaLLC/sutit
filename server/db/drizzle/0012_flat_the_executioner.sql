ALTER TABLE "forms" ALTER COLUMN "accept_responses" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "submission_deleted_at_idx" ON "form_submissions" USING btree ("deleted_at");