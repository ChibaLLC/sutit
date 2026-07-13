CREATE TYPE "public"."form_payout_method" AS ENUM('phone', 'till', 'paybill');--> statement-breakpoint
CREATE TYPE "public"."disbursement_method" AS ENUM('phone', 'till', 'paybill');--> statement-breakpoint
CREATE TYPE "public"."disbursement_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "disbursements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"form_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"method" "disbursement_method" NOT NULL,
	"destination" varchar(100) NOT NULL,
	"account_number" varchar(100),
	"status" "disbursement_status" DEFAULT 'pending' NOT NULL,
	"conversation_id" text,
	"originator_conversation_id" text,
	"transaction_id" varchar(100),
	"result_code" integer,
	"result_desc" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "payout_method" "form_payout_method";--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "payout_phone" varchar(30);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "payout_till" varchar(30);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "payout_paybill" varchar(30);--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "payout_account_number" varchar(100);--> statement-breakpoint
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "disbursement_payment_id_idx" ON "disbursements" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "disbursement_form_id_idx" ON "disbursements" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "disbursement_status_idx" ON "disbursements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "disbursement_conversation_id_idx" ON "disbursements" USING btree ("conversation_id");