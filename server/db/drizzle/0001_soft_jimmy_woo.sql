ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "forms" DROP CONSTRAINT "forms_user_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "stores" DROP CONSTRAINT "stores_form_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "form_payments" DROP CONSTRAINT "form_payments_form_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "form_payments" DROP CONSTRAINT "form_payments_payment_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "store_payments" DROP CONSTRAINT "store_payments_store_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "store_payments" DROP CONSTRAINT "store_payments_payment_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "form_responses" DROP CONSTRAINT "form_responses_form_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "form_responses" DROP CONSTRAINT "form_responses_user_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "store_responses" DROP CONSTRAINT "store_responses_store_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "store_responses" DROP CONSTRAINT "store_responses_user_ulid_fkey";
--> statement-breakpoint
ALTER TABLE "form_responses" DROP CONSTRAINT "form_responses_pkey";--> statement-breakpoint
ALTER TABLE "store_responses" DROP CONSTRAINT "store_responses_pkey";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sys_logs" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "form_payments" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "form_payments" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "store_payments" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "store_payments" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "form_responses" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "form_responses" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "store_responses" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "store_responses" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "form_responses" ADD COLUMN "id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "form_responses" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "store_responses" ADD COLUMN "id" serial NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_ulid_users_ulid_fk" FOREIGN KEY ("user_ulid") REFERENCES "users"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forms" ADD CONSTRAINT "forms_user_ulid_users_ulid_fk" FOREIGN KEY ("user_ulid") REFERENCES "users"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stores" ADD CONSTRAINT "stores_form_ulid_forms_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "forms"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_form_ulid_forms_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "forms"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_payment_ulid_payments_ulid_fk" FOREIGN KEY ("payment_ulid") REFERENCES "payments"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_store_ulid_stores_ulid_fk" FOREIGN KEY ("store_ulid") REFERENCES "stores"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_payment_ulid_payments_ulid_fk" FOREIGN KEY ("payment_ulid") REFERENCES "payments"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_ulid_forms_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "forms"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_responses" ADD CONSTRAINT "store_responses_store_ulid_stores_ulid_fk" FOREIGN KEY ("store_ulid") REFERENCES "stores"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "form_responses" DROP COLUMN IF EXISTS "user_ulid";--> statement-breakpoint
ALTER TABLE "store_responses" DROP COLUMN IF EXISTS "user_ulid";