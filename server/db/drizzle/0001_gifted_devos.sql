ALTER TABLE "form_meta" ADD COLUMN "group_member_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "form_meta" ADD COLUMN "group_invite_message" text;--> statement-breakpoint
ALTER TABLE "form_meta" ADD COLUMN "withdrawn_funds" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "form_meta" DROP COLUMN IF EXISTS "price_group_count";--> statement-breakpoint
ALTER TABLE "form_meta" DROP COLUMN IF EXISTS "price_group_message";--> statement-breakpoint
ALTER TABLE "form_meta" DROP COLUMN IF EXISTS "updated_at";