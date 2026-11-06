-- Phase 2: Leads/Kunden, Angebote mit Online-Annahme, Aufträge mit Planung und Tasks, Rechnungen mit Zahlungen,
-- Massblätter mit Versionen, Firmeneinstellungen, Nummernkreise, Termin-Erinnerung. Idempotent (IF NOT EXISTS).

-- Kontakt: Lead/Kunde, Pipeline, Adresse (für Rechnung und QR-Zahlteil)
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'lead' NOT NULL;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "lead_phase" text DEFAULT 'neu' NOT NULL;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "verloren_grund" text;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "potenzial_rp" integer;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "kunde_seit" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "anrede" text;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "strasse" text;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "plz" text;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "ort" text;
--> statement-breakpoint
ALTER TABLE "kontakt" ADD COLUMN IF NOT EXISTS "land" text DEFAULT 'CH' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "kontakt_status_idx" ON "kontakt" ("status", "lead_phase");
--> statement-breakpoint

-- Termin: Erinnerung 2 h vorher, Bezug zum Auftrag (Massnehmen, Anprobe, Abholung)
ALTER TABLE "termin" ADD COLUMN IF NOT EXISTS "erinnerung_gesendet_am" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "termin" ADD COLUMN IF NOT EXISTS "zweck" text DEFAULT 'beratung' NOT NULL;
--> statement-breakpoint
ALTER TABLE "termin" ADD COLUMN IF NOT EXISTS "auftrag_id" uuid;
--> statement-breakpoint
ALTER TABLE "termin" ADD COLUMN IF NOT EXISTS "dauer_min" integer DEFAULT 90 NOT NULL;
--> statement-breakpoint

-- Angebot
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "titel" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "einleitung" text;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "schluss" text;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "stil" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "stoffe" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "rabatt_prozent" numeric(5, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "rabatt_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "mwst_satz" numeric(4, 2) DEFAULT '8.1' NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "mwst_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "token_hash" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "angebot_token_idx" ON "angebot" ("token_hash");
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "gesendet_am" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "angesehen_am" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "angenommen_am" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "angenommen_name" text;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "angenommen_weg" text;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "abgelehnt_am" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "abgelehnt_grund" text;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "erstellt_von" uuid;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "angebot_kontakt_idx" ON "angebot" ("kontakt_id", "erstellt_am");
--> statement-breakpoint

-- Auftrag mit Planung
ALTER TABLE "auftrag" ALTER COLUMN "status" SET DEFAULT 'mass';
--> statement-breakpoint
UPDATE "auftrag" SET "status" = 'mass' WHERE "status" = 'offen';
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "titel" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "stil" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "stoffe" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "mwst_satz" numeric(4, 2) DEFAULT '8.1' NOT NULL;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "mwst_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "rabatt_prozent" numeric(5, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "rabatt_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "anlass" text;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "anlass_datum" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "abholung_geplant" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "bestellnotiz" text;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "massblatt_id" uuid;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "zustaendig_id" uuid;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "status_zeiten" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "abgeschlossen_am" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auftrag_status_idx" ON "auftrag" ("status", "liefertermin");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auftrag_kontakt_idx" ON "auftrag" ("kontakt_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "auftrag_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auftrag_id" uuid NOT NULL REFERENCES "auftrag"("id") ON DELETE CASCADE,
	"titel" text NOT NULL,
	"schritt" text,
	"faellig_am" timestamp with time zone,
	"erledigt_am" timestamp with time zone,
	"erledigt_von" uuid REFERENCES "admin_user"("id") ON DELETE SET NULL,
	"zustaendig_id" uuid REFERENCES "admin_user"("id") ON DELETE SET NULL,
	"reihenfolge" integer DEFAULT 0 NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auftrag_task_auftrag_idx" ON "auftrag_task" ("auftrag_id", "reihenfolge");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auftrag_task_faellig_idx" ON "auftrag_task" ("faellig_am") WHERE "erledigt_am" IS NULL;
--> statement-breakpoint

-- Rechnung
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "art" text DEFAULT 'rechnung' NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "titel" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "einleitung" text;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "schluss" text;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "rabatt_prozent" numeric(5, 2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "rabatt_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "mwst_satz" numeric(4, 2) DEFAULT '8.1' NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "mwst_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "abzug" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "betrag_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "bezahlt_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "rechnungsdatum" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "gesendet_am" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "referenz" text;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "storniert_am" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "erstellt_von" uuid;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rechnung_status_idx" ON "rechnung" ("status", "faellig_am");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rechnung_auftrag_idx" ON "rechnung" ("auftrag_id");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "zahlung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rechnung_id" uuid NOT NULL REFERENCES "rechnung"("id") ON DELETE CASCADE,
	"betrag_rp" integer NOT NULL,
	"datum" timestamp with time zone NOT NULL,
	"art" text DEFAULT 'bank' NOT NULL,
	"notiz" text,
	"admin_user_id" uuid REFERENCES "admin_user"("id") ON DELETE SET NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "zahlung_rechnung_idx" ON "zahlung" ("rechnung_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "zahlung_datum_idx" ON "zahlung" ("datum");
--> statement-breakpoint

-- Massblatt: Versionen (die neueste ist aktiv), Körperhaltung, Datum, wer gemessen hat
ALTER TABLE "massblatt" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "massblatt" ADD COLUMN IF NOT EXISTS "koerper" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "massblatt" ADD COLUMN IF NOT EXISTS "gemessen_am" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "massblatt" ADD COLUMN IF NOT EXISTS "gemessen_von" uuid;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "massblatt_kontakt_idx" ON "massblatt" ("kontakt_id", "version");
--> statement-breakpoint

-- Verlauf: Bezug zu Belegen
ALTER TABLE "aktivitaet" ADD COLUMN IF NOT EXISTS "angebot_id" uuid;
--> statement-breakpoint
ALTER TABLE "aktivitaet" ADD COLUMN IF NOT EXISTS "auftrag_id" uuid;
--> statement-breakpoint
ALTER TABLE "aktivitaet" ADD COLUMN IF NOT EXISTS "rechnung_id" uuid;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "aktivitaet_auftrag_idx" ON "aktivitaet" ("auftrag_id", "erstellt_am");
--> statement-breakpoint

-- Firmeneinstellungen (Schlüssel/Wert) und Nummernkreise
CREATE TABLE IF NOT EXISTS "firma_einstellung" (
	"schluessel" text PRIMARY KEY NOT NULL,
	"wert" jsonb NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nummernkreis" (
	"praefix" text NOT NULL,
	"jahr" integer NOT NULL,
	"zaehler" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "nummernkreis_pk" PRIMARY KEY ("praefix", "jahr")
);
--> statement-breakpoint

-- Bestehende Kontakte mit angenommenem Angebot oder Auftrag sind Kunden
UPDATE "kontakt" SET "status" = 'kunde', "lead_phase" = 'gewonnen', "kunde_seit" = COALESCE("kunde_seit", now())
 WHERE "status" = 'lead' AND ("id" IN (SELECT "kontakt_id" FROM "auftrag" WHERE "kontakt_id" IS NOT NULL)
   OR "id" IN (SELECT "kontakt_id" FROM "angebot" WHERE "status" = 'angenommen' AND "kontakt_id" IS NOT NULL));
--> statement-breakpoint
UPDATE "kontakt" SET "lead_phase" = 'termin'
 WHERE "status" = 'lead' AND "lead_phase" = 'neu' AND "id" IN (SELECT "kontakt_id" FROM "termin" WHERE "status" IN ('bestaetigt', 'erledigt'));
