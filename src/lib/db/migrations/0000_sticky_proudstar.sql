CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(64) NOT NULL,
	"password" varchar(64),
	"role" varchar(20) DEFAULT 'guest' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"description_vi" text,
	"url" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"tags" jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"image" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"status" varchar(20) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Tools" ADD CONSTRAINT "Tools_created_by_User_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;