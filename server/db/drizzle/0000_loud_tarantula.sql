CREATE TABLE IF NOT EXISTS "form_fields" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"input_type" varchar(40) NOT NULL,
	"index" integer NOT NULL,
	"description" text,
	"placeholder" varchar(255),
	"options" jsonb,
	"accept" varchar(255),
	"type" varchar,
	"page" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_groups" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"group_name" varchar(255) NOT NULL,
	"invites" jsonb,
	"payment_ulid" varchar(255),
	"form_ulid" varchar(255) NOT NULL,
	CONSTRAINT "form_groups_group_name_form_ulid_unique" UNIQUE NULLS NOT DISTINCT("group_name","form_ulid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_meta" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_name" varchar(255) NOT NULL,
	"form_description" text,
	"user_ulid" varchar(255) NOT NULL,
	"price_individual" integer DEFAULT 0 NOT NULL,
	"price_group_amount" integer DEFAULT 0 NOT NULL,
	"price_group_count" integer DEFAULT 0,
	"price_group_message" text,
	"allow_groups" boolean DEFAULT false,
	"require_merch" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_pages" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_ulid" varchar,
	"index" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_items" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"index" integer NOT NULL,
	"store" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL,
	"likes" integer DEFAULT 0,
	"images" jsonb NOT NULL,
	"store_ulid" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stores" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_ulid" varchar,
	"index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_payments" (
	"form_ulid" varchar(255) NOT NULL,
	"payment_ulid" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_payments_pkey" PRIMARY KEY("form_ulid","payment_ulid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_payments" (
	"store_ulid" varchar(255) NOT NULL,
	"payment_ulid" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_payments_pkey" PRIMARY KEY("store_ulid","payment_ulid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_field_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"field_ulid" varchar(255) NOT NULL,
	"value" text,
	"form_response_ulid" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_group_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_ulid" varchar(255) NOT NULL,
	"form_group_ulid" varchar NOT NULL,
	"response_ulid" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"price_paid" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"price_paid" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"reference_code" varchar(30) NOT NULL,
	"phone_number" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"receipt_number" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_reference_code_key" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"transaction_code" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"user_ulid" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"salt" varchar(255) NOT NULL,
	"is_deleted" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "token_index" ON "sessions" ("token");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_page_form_pages_ulid_fk" FOREIGN KEY ("page") REFERENCES "form_pages"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_meta" ADD CONSTRAINT "form_meta_user_ulid_users_ulid_fk" FOREIGN KEY ("user_ulid") REFERENCES "users"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_pages" ADD CONSTRAINT "form_pages_form_ulid_form_meta_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "form_meta"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_items" ADD CONSTRAINT "store_items_store_ulid_stores_ulid_fk" FOREIGN KEY ("store_ulid") REFERENCES "stores"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stores" ADD CONSTRAINT "stores_form_ulid_form_meta_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "form_meta"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_form_ulid_form_meta_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "form_meta"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_payment_ulid_payments_ulid_fk" FOREIGN KEY ("payment_ulid") REFERENCES "payments"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_store_ulid_stores_ulid_fk" FOREIGN KEY ("store_ulid") REFERENCES "stores"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_payment_ulid_payments_ulid_fk" FOREIGN KEY ("payment_ulid") REFERENCES "payments"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_field_responses" ADD CONSTRAINT "form_field_responses_field_ulid_form_fields_ulid_fk" FOREIGN KEY ("field_ulid") REFERENCES "form_fields"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_field_responses" ADD CONSTRAINT "form_field_responses_form_response_ulid_form_responses_ulid_fk" FOREIGN KEY ("form_response_ulid") REFERENCES "form_responses"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_group_responses" ADD CONSTRAINT "form_group_responses_form_group_ulid_form_groups_ulid_fk" FOREIGN KEY ("form_group_ulid") REFERENCES "form_groups"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_group_responses" ADD CONSTRAINT "form_group_responses_response_ulid_form_responses_ulid_fk" FOREIGN KEY ("response_ulid") REFERENCES "form_responses"("ulid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_ulid_users_ulid_fk" FOREIGN KEY ("user_ulid") REFERENCES "users"("ulid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
