CREATE TABLE "form_group_member_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"paid_by" text,
	"amount" integer NOT NULL,
	"payment_type" varchar(50) DEFAULT 'self_paid' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "form_group_member_payments" ADD CONSTRAINT "form_group_member_payments_group_id_form_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."form_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group_member_payments" ADD CONSTRAINT "form_group_member_payments_member_id_form_group_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."form_group_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group_member_payments" ADD CONSTRAINT "form_group_member_payments_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_group_member_payments" ADD CONSTRAINT "form_group_member_payments_paid_by_user_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "group_member_payment_group_id_idx" ON "form_group_member_payments" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "group_member_payment_member_id_idx" ON "form_group_member_payments" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "group_member_payment_payment_id_idx" ON "form_group_member_payments" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "group_member_payment_paid_by_idx" ON "form_group_member_payments" USING btree ("paid_by");--> statement-breakpoint
CREATE INDEX "group_member_payment_status_idx" ON "form_group_member_payments" USING btree ("status");