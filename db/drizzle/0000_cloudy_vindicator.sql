-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "users" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"salt" varchar(255) NOT NULL,
	"is_deleted" boolean,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"user_ulid" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "sessions_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"reference_code" varchar(30) NOT NULL,
	"phone_number" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "payments_reference_code_key" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forms" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_name" varchar(255) NOT NULL,
	"form_description" text,
	"pages" jsonb NOT NULL,
	"price" integer NOT NULL,
	"user_ulid" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stores" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_ulid" varchar(255) NOT NULL,
	"store" jsonb NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sys_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" varchar(10) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_payments" (
	"form_ulid" varchar(255) NOT NULL,
	"payment_ulid" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "form_payments_pkey" PRIMARY KEY("form_ulid","payment_ulid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_payments" (
	"store_ulid" varchar(255) NOT NULL,
	"payment_ulid" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "store_payments_pkey" PRIMARY KEY("store_ulid","payment_ulid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_responses" (
	"form_ulid" varchar(255) NOT NULL,
	"user_ulid" varchar(255) NOT NULL,
	"response" jsonb NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "form_responses_pkey" PRIMARY KEY("form_ulid","user_ulid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_responses" (
	"store_ulid" varchar(255) NOT NULL,
	"user_ulid" varchar(255) NOT NULL,
	"response" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "store_responses_pkey" PRIMARY KEY("store_ulid","user_ulid")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token_index" ON "sessions" ("token");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_ulid_fkey" FOREIGN KEY ("user_ulid") REFERENCES "public"."users"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forms" ADD CONSTRAINT "forms_user_ulid_fkey" FOREIGN KEY ("user_ulid") REFERENCES "public"."users"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stores" ADD CONSTRAINT "stores_form_ulid_fkey" FOREIGN KEY ("form_ulid") REFERENCES "public"."forms"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_form_ulid_fkey" FOREIGN KEY ("form_ulid") REFERENCES "public"."forms"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_payment_ulid_fkey" FOREIGN KEY ("payment_ulid") REFERENCES "public"."payments"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_store_ulid_fkey" FOREIGN KEY ("store_ulid") REFERENCES "public"."stores"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_payment_ulid_fkey" FOREIGN KEY ("payment_ulid") REFERENCES "public"."payments"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_ulid_fkey" FOREIGN KEY ("form_ulid") REFERENCES "public"."forms"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_user_ulid_fkey" FOREIGN KEY ("user_ulid") REFERENCES "public"."users"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_responses" ADD CONSTRAINT "store_responses_store_ulid_fkey" FOREIGN KEY ("store_ulid") REFERENCES "public"."stores"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_responses" ADD CONSTRAINT "store_responses_user_ulid_fkey" FOREIGN KEY ("user_ulid") REFERENCES "public"."users"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/