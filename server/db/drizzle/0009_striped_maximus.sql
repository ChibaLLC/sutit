ALTER TABLE "form_payments" DROP CONSTRAINT "form_payments_form_ulid_forms_ulid_fk";
--> statement-breakpoint
ALTER TABLE "store_payments" DROP CONSTRAINT "store_payments_store_ulid_stores_ulid_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_form_ulid_forms_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "forms"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_store_ulid_stores_ulid_fk" FOREIGN KEY ("store_ulid") REFERENCES "stores"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
