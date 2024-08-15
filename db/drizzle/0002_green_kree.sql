CREATE TABLE IF NOT EXISTS "with_drawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"transaction_code" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
