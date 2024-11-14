ALTER TABLE "forms" RENAME COLUMN "price" TO "price_individual";--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "price_individual" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "price_group_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "price_group_count" integer DEFAULT 0;