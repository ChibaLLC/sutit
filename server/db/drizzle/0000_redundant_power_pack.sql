CREATE TYPE "public"."field_type" AS ENUM('text', 'textarea', 'number', 'email', 'phone', 'date', 'time', 'datetime', 'select', 'multiselect', 'radio', 'checkbox', 'file', 'image', 'signature', 'rating', 'scale', 'matrix', 'section', 'payment', 'hidden', 'calculated');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('draft', 'published', 'archived', 'closed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded', 'partial', 'deferred');--> statement-breakpoint
CREATE TYPE "public"."registration_type" AS ENUM('single', 'recurring', 'group');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'completed', 'partial', 'abandoned', 'processing');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'pending');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('active', 'inactive', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "field_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" text,
	"parsed_value" jsonb,
	"validation_status" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "response_submission_field" UNIQUE("submission_id","field_id")
);
--> statement-breakpoint
CREATE TABLE "form_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"analytics_date" date NOT NULL,
	"views" integer DEFAULT 0,
	"unique_views" integer DEFAULT 0,
	"submissions" integer DEFAULT 0,
	"completion_rate" real,
	"avg_completion_time" integer,
	"bounce_rate" real,
	"detailed_stats" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_form_date" UNIQUE("form_id","analytics_date")
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"field_type" "field_type" NOT NULL,
	"label" varchar(500) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"placeholder" varchar(500),
	"properties" jsonb DEFAULT '{}'::jsonb,
	"validation" jsonb DEFAULT '{}'::jsonb,
	"conditions" jsonb DEFAULT '{}'::jsonb,
	"required" boolean DEFAULT false,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"title" varchar(255),
	"description" text,
	"order_index" integer NOT NULL,
	"conditions" jsonb DEFAULT '{}'::jsonb,
	"repeatable" boolean DEFAULT false,
	"max_repetitions" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"submitter_id" text,
	"status" "submission_status" DEFAULT 'pending',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"source" varchar(100),
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" "form_status" DEFAULT 'draft',
	"settings" jsonb DEFAULT '{}'::jsonb,
	"theme" jsonb DEFAULT '{}'::jsonb,
	"slug" varchar(255) NOT NULL,
	"is_public" boolean DEFAULT false,
	"requires_login" boolean DEFAULT false,
	"allow_multiple_submissions" boolean DEFAULT false,
	"allow_registration_reuse" boolean DEFAULT false,
	"submission_limit" integer,
	"registration_type" "registration_type" DEFAULT 'single',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"published_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_slug_user_unique" UNIQUE("slug","created_by")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "field_responses" ADD CONSTRAINT "field_responses_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_responses" ADD CONSTRAINT "field_responses_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_analytics" ADD CONSTRAINT "form_analytics_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_section_id_form_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."form_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_sections" ADD CONSTRAINT "form_sections_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_submitter_id_user_id_fk" FOREIGN KEY ("submitter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "response_submission_idx" ON "field_responses" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "response_field_idx" ON "field_responses" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "response_created_at_idx" ON "field_responses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "response_updated_at_idx" ON "field_responses" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "analytics_form_idx" ON "form_analytics" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "analytics_date_idx" ON "form_analytics" USING btree ("analytics_date");--> statement-breakpoint
CREATE INDEX "analytics_created_at_idx" ON "form_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "field_section_idx" ON "form_fields" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "field_name_idx" ON "form_fields" USING btree ("name");--> statement-breakpoint
CREATE INDEX "field_created_at_idx" ON "form_fields" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "section_form_idx" ON "form_sections" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "section_order_idx" ON "form_sections" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "section_created_at_idx" ON "form_sections" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "submission_form_idx" ON "form_submissions" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "submission_status_idx" ON "form_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submission_submitter_idx" ON "form_submissions" USING btree ("submitter_id");--> statement-breakpoint
CREATE INDEX "submission_submitted_at_idx" ON "form_submissions" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "submission_completed_at_idx" ON "form_submissions" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "submission_updated_at_idx" ON "form_submissions" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "form_status_idx" ON "forms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "form_created_by_idx" ON "forms" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "form_created_at_idx" ON "forms" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "form_updated_at_idx" ON "forms" USING btree ("updated_at");