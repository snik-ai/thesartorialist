-- Web-Push für die Admin-App: Einstellungen (VAPID-Schlüssel, automatisch erzeugt) und Abos je Gerät.
CREATE TABLE IF NOT EXISTS "einstellung" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"wert" jsonb NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_abo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL REFERENCES "admin_user"("id") ON DELETE cascade,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"geraet" text,
	"user_agent" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"zuletzt_ok" timestamp with time zone,
	"fehler" text,
	CONSTRAINT "push_abo_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "push_abo_admin_idx" ON "push_abo" USING btree ("admin_user_id");
