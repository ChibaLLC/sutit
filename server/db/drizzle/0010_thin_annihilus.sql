CREATE TABLE IF NOT EXISTS "group_form_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_name" varchar(255) NOT NULL,
	"invites" jsonb,
	"payment_ulid" varchar(255) NOT NULL,
	"form_ulid" varchar(255) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_form_responses" ADD CONSTRAINT "group_form_responses_payment_ulid_payments_ulid_fk" FOREIGN KEY ("payment_ulid") REFERENCES "payments"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_form_responses" ADD CONSTRAINT "group_form_responses_form_ulid_forms_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "forms"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
