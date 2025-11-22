ALTER TABLE "form_fields" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "form_pages" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "form_stores" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "store_items" ADD COLUMN "deleted_at" timestamp;