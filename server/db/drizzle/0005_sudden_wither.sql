CREATE TABLE IF NOT EXISTS "prepaid_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_ulid" varchar(255),
	"payment_ulid" varchar(255),
	"token" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_reference_code_key";