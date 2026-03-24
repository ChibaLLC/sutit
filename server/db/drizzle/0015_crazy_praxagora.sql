ALTER TABLE "dispatches" ADD COLUMN "delivery_token" varchar(255);--> statement-breakpoint
ALTER TABLE "dispatches" ADD COLUMN "delivery_confirmed_at" timestamp;