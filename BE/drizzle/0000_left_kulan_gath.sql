CREATE TABLE "links" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text,
	"target" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_source_nodes_id_fk" FOREIGN KEY ("source") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_target_nodes_id_fk" FOREIGN KEY ("target") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;