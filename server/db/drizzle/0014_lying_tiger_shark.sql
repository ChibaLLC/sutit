CREATE TYPE "public"."dispatch_status" AS ENUM('pending', 'dispatched', 'delivered');--> statement-breakpoint
CREATE TABLE "dispatches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"status" "dispatch_status" DEFAULT 'pending',
	"dispatched_by" varchar(255),
	"dispatched_at" timestamp,
	"delivery_date" timestamp,
	"delivered_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dispatches_submission_id_unique" UNIQUE("submission_id")
);
--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "is_public" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dispatch_submission_idx" ON "dispatches" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "dispatch_status_idx" ON "dispatches" USING btree ("status");