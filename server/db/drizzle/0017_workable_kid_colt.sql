CREATE TYPE "public"."event_status" AS ENUM('upcoming', 'ongoing', 'past', 'cancelled');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"timezone" varchar(100) DEFAULT 'UTC',
	"venue_name" varchar(500),
	"venue_address" text,
	"venue_map_url" varchar(500),
	"contact_phone" varchar(50),
	"contact_email" varchar(255),
	"category" varchar(100),
	"audience" varchar(255),
	"images" jsonb DEFAULT '[]'::jsonb,
	"is_featured" boolean DEFAULT false,
	"is_free" boolean DEFAULT true,
	"refund_policy" text,
	"status" "event_status" DEFAULT 'upcoming',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug"),
	CONSTRAINT "event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "has_event" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_form_idx" ON "events" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "event_status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "event_slug_idx" ON "events" USING btree ("slug");