-- Wochenplanung: private Einträge / Blocker (blockieren Slots für Kundentermine), optional wöchentlich. Idempotent.
CREATE TABLE IF NOT EXISTS "kalender_eintrag" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "titel" text NOT NULL,
  "start" timestamp with time zone NOT NULL,
  "ende" timestamp with time zone NOT NULL,
  "ganztaegig" boolean DEFAULT false NOT NULL,
  "notiz" text,
  "wiederholung" text,
  "admin_user_id" uuid,
  "erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
  "aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "kalender_eintrag" ADD CONSTRAINT "kalender_eintrag_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kalender_eintrag_start_idx" ON "kalender_eintrag" USING btree ("start","ende");
