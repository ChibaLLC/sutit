CREATE TABLE "form_fields" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"input_type" varchar(40) NOT NULL,
	"index" integer NOT NULL,
	"description" text,
	"placeholder" varchar(255),
	"options" jsonb,
	"accept" varchar(255),
	"type" varchar,
	"rules" jsonb,
	"page" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_groups" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"group_name" varchar(255) NOT NULL,
	"invites" jsonb,
	"payment_ulid" varchar(255),
	"form_ulid" varchar(255) NOT NULL,
	CONSTRAINT "form_groups_group_name_form_ulid_unique" UNIQUE NULLS NOT DISTINCT("group_name","form_ulid")
);
--> statement-breakpoint
CREATE TABLE "form_meta" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_name" varchar(255) NOT NULL,
	"form_description" text,
	"user_ulid" varchar(255) NOT NULL,
	"price_individual" integer DEFAULT 0 NOT NULL,
	"price_group_amount" integer DEFAULT 0 NOT NULL,
	"group_member_count" integer DEFAULT 0,
	"group_invite_message" text,
	"allow_groups" boolean DEFAULT false,
	"require_merch" boolean DEFAULT false,
	"withdrawn_funds" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_pages" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_ulid" varchar,
	"index" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_items" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"index" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"stock" integer NOT NULL,
	"price" integer NOT NULL,
	"likes" integer DEFAULT 0,
	"images" jsonb NOT NULL,
	"is_infinite" boolean DEFAULT false,
	"store_ulid" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_ulid" varchar,
	"index" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_payments" (
	"form_ulid" varchar(255) NOT NULL,
	"payment_ulid" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_payments_pkey" PRIMARY KEY("form_ulid","payment_ulid")
);
--> statement-breakpoint
CREATE TABLE "store_payments" (
	"store_ulid" varchar(255) NOT NULL,
	"payment_ulid" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_payments_pkey" PRIMARY KEY("store_ulid","payment_ulid")
);
--> statement-breakpoint
CREATE TABLE "form_field_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"field_ulid" varchar(255) NOT NULL,
	"value" text,
	"form_response_ulid" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_group_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_ulid" varchar(255) NOT NULL,
	"form_group_ulid" varchar NOT NULL,
	"response_ulid" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "form_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"price_paid" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"item_ulid" varchar(255) NOT NULL,
	"liked" boolean DEFAULT false,
	"carted" boolean DEFAULT false,
	"value" text,
	"qtty" integer DEFAULT 1,
	"store_response_ulid" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_responses" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"form_response_ulid" varchar NOT NULL,
	"price_paid" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"reference_code" varchar(30) NOT NULL,
	"phone_number" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"receipt_number" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_reference_code_key" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"transaction_code" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"ulid" varchar(255) PRIMARY KEY NOT NULL,
	"user_ulid" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
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
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_page_form_pages_ulid_fk" FOREIGN KEY ("page") REFERENCES "public"."form_pages"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_meta" ADD CONSTRAINT "form_meta_user_ulid_users_ulid_fk" FOREIGN KEY ("user_ulid") REFERENCES "public"."users"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_pages" ADD CONSTRAINT "form_pages_form_ulid_form_meta_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "public"."form_meta"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_items" ADD CONSTRAINT "store_items_store_ulid_stores_ulid_fk" FOREIGN KEY ("store_ulid") REFERENCES "public"."stores"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_form_ulid_form_meta_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "public"."form_meta"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_form_ulid_form_meta_ulid_fk" FOREIGN KEY ("form_ulid") REFERENCES "public"."form_meta"("ulid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_payments" ADD CONSTRAINT "form_payments_payment_ulid_payments_ulid_fk" FOREIGN KEY ("payment_ulid") REFERENCES "public"."payments"("ulid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_store_ulid_stores_ulid_fk" FOREIGN KEY ("store_ulid") REFERENCES "public"."stores"("ulid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_payments" ADD CONSTRAINT "store_payments_payment_ulid_payments_ulid_fk" FOREIGN KEY ("payment_ulid") REFERENCES "public"."payments"("ulid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field_responses" ADD CONSTRAINT "form_field_responses_field_ulid_form_fields_ulid_fk" FOREIGN KEY ("field_ulid") REFERENCES "public"."form_fields"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field_responses" ADD CONSTRAINT "form_field_responses_form_response_ulid_form_responses_ulid_fk" FOREIGN KEY ("form_response_ulid") REFERENCES "public"."form_responses"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group_responses" ADD CONSTRAINT "form_group_responses_form_group_ulid_form_groups_ulid_fk" FOREIGN KEY ("form_group_ulid") REFERENCES "public"."form_groups"("ulid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group_responses" ADD CONSTRAINT "form_group_responses_response_ulid_form_responses_ulid_fk" FOREIGN KEY ("response_ulid") REFERENCES "public"."form_responses"("ulid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_responses" ADD CONSTRAINT "item_responses_item_ulid_store_items_ulid_fk" FOREIGN KEY ("item_ulid") REFERENCES "public"."store_items"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_responses" ADD CONSTRAINT "item_responses_store_response_ulid_store_responses_ulid_fk" FOREIGN KEY ("store_response_ulid") REFERENCES "public"."store_responses"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_responses" ADD CONSTRAINT "store_responses_form_response_ulid_form_responses_ulid_fk" FOREIGN KEY ("form_response_ulid") REFERENCES "public"."form_responses"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_ulid_users_ulid_fk" FOREIGN KEY ("user_ulid") REFERENCES "public"."users"("ulid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "token_index" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE VIEW "public"."sutit_forms" AS (select "form_meta"."ulid", "form_meta"."form_name", "form_meta"."form_description", "form_meta"."user_ulid", "form_meta"."price_individual", "form_meta"."price_group_amount", "form_meta"."group_member_count", "form_meta"."group_invite_message", "form_meta"."allow_groups", "form_meta"."require_merch", "form_meta"."withdrawn_funds", "form_meta"."created_at", "form_meta"."updated_at", "form_field_ulid", "form_pages_page_ulid", "form_pages_formUlid", "form_elements"."label", "form_elements"."input_type", "form_fields_index", "form_elements"."description", "form_elements"."placeholder", "form_elements"."options", "form_elements"."accept", "form_elements"."type", "form_elements"."rules", "form_pages_index" from "form_meta" left join (select "form_fields"."ulid" as "form_field_ulid", "form_fields"."page" as "form_pages_page_ulid", "form_pages"."form_ulid" as "form_pages_formUlid", "form_fields"."label", "form_fields"."input_type", "form_fields"."index" as "form_fields_index", "form_fields"."description", "form_fields"."placeholder", "form_fields"."options", "form_fields"."accept", "form_fields"."type", "form_fields"."rules", "form_pages"."index" as "form_pages_index" from "form_pages" inner join "form_fields" on "form_pages"."ulid" = "form_fields"."page") "form_elements" on "form_meta"."ulid" = "form_pages_formUlid");--> statement-breakpoint
CREATE VIEW "public"."sutit_stores" AS (select "item_ulid", "stores_ulid", "form_ulid", "store_items_index", "name", "stock", "price", "likes", "images", "is_infinite", "stores_index" from (select "store_items"."ulid" as "item_ulid", "stores"."ulid" as "stores_ulid", "stores"."form_ulid", "store_items"."index" as "store_items_index", "store_items"."name", "store_items"."stock", "store_items"."price", "store_items"."likes", "store_items"."images", "store_items"."is_infinite", "stores"."index" as "stores_index" from "stores" inner join "store_items" on "stores"."ulid" = "store_items"."store_ulid") "store_items" where "store_items"."form_ulid" is not null);--> statement-breakpoint
CREATE VIEW "public"."form_responses_view" AS (select "form_responses"."ulid" as "response_ulid", "form_field_ulid" as "response_field_ulid", "form_elements_ulid" as "response_form_ulid", "form_field_responses"."value", "form_responses"."price_paid", "form_responses"."created_at" from "form_responses" left join (select "form_field_responses"."form_response_ulid" as "form_response_ulid", "fields_ulid" as "form_field_ulid", "form_field_responses"."value", "form_ulid" as "form_elements_ulid" from "form_field_responses" inner join (select "form_pages"."form_ulid" as "form_ulid", "form_fields"."ulid" as "fields_ulid" from "form_pages" inner join "form_fields" on "form_pages"."ulid" = "form_fields"."page") "form_elements" on "form_field_responses"."field_ulid" = "fields_ulid") "form_field_responses" on "form_responses"."ulid" = "form_response_ulid");--> statement-breakpoint
CREATE VIEW "public"."store_responses_view" AS (select "store_responses"."ulid" as "store_response_ulid", "store_item_ulid" as "store_response_item_ulid", "store_items_ulid" as "store_response_form_ulid", "store_responses"."form_response_ulid", "qtty", "store_items_responses"."value", "store_responses"."price_paid", "store_responses"."created_at" from "store_responses" left join (select "item_responses"."store_response_ulid" as "store_response_ulid", "item_ulid_view" as "store_item_ulid", "item_responses"."value", "store_form_ulid" as "store_items_ulid", "item_responses"."qtty" as "qtty" from "item_responses" inner join (select "stores"."form_ulid" as "store_form_ulid", "store_items"."ulid" as "item_ulid_view", "store_items"."likes" from "stores" inner join "store_items" on "stores"."ulid" = "store_items"."store_ulid") "store_items" on "item_responses"."item_ulid" = "item_ulid_view") "store_items_responses" on "store_responses"."ulid" = "store_response_ulid");