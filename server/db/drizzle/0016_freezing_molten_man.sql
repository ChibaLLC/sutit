CREATE TYPE "public"."batch_status" AS ENUM('open', 'dispatched', 'delivered', 'closed');--> statement-breakpoint
CREATE TABLE "dispatch_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "batch_status" DEFAULT 'open',
	"dispatched_by" varchar(255),
	"dispatched_at" timestamp,
	"delivery_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dispatches" ADD COLUMN "batch_id" uuid;--> statement-breakpoint
ALTER TABLE "dispatch_batches" ADD CONSTRAINT "dispatch_batches_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batch_form_idx" ON "dispatch_batches" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "batch_status_idx" ON "dispatch_batches" USING btree ("status");--> statement-breakpoint
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_batch_id_dispatch_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."dispatch_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dispatch_batch_idx" ON "dispatches" USING btree ("batch_id");