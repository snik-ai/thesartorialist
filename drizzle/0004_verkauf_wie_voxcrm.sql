-- Verkauf wie VoxCRM: A4-Editor (Positionen mit Art/Einheit/MWST je Zeile), Dokumentsprache, Versionen,
-- Mahnwesen und Produktkatalog. Idempotent (IF NOT EXISTS); bestehende Daten aus Phase 2 werden übernommen.

-- Angebot: Dokumentdatum, Sprache, Stil-Anhang, Version, Ansichten
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "datum" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "sprache" text DEFAULT 'de' NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "stil_anhang" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "angesehen_anzahl" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
-- Datum bestehender Angebote: gesendet bzw. erstellt
UPDATE "angebot" SET "datum" = COALESCE("gesendet_am", "erstellt_am") WHERE "datum" > COALESCE("gesendet_am", "erstellt_am");
--> statement-breakpoint
UPDATE "angebot" SET "angesehen_anzahl" = 1 WHERE "angesehen_am" IS NOT NULL AND "angesehen_anzahl" = 0;
--> statement-breakpoint

-- Rechnung: Sprache, Version, Mahnwesen
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "sprache" text DEFAULT 'de' NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "mahnstufe" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "mahnfrist_bis" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "rechnung" ADD COLUMN IF NOT EXISTS "mahngebuehren_rp" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint

-- Dokumentsprache aus der Sprache des Kontakts (de/en/fr/it; übrige Sprachen → Englisch)
UPDATE "angebot" a SET "sprache" = CASE WHEN k."sprache" IN ('de', 'en', 'fr', 'it') THEN k."sprache" ELSE 'en' END
  FROM "kontakt" k WHERE k."id" = a."kontakt_id" AND a."sprache" = 'de' AND k."sprache" <> 'de';
--> statement-breakpoint
UPDATE "rechnung" r SET "sprache" = CASE WHEN k."sprache" IN ('de', 'en', 'fr', 'it') THEN k."sprache" ELSE 'en' END
  FROM "kontakt" k WHERE k."id" = r."kontakt_id" AND r."sprache" = 'de' AND k."sprache" <> 'de';
--> statement-breakpoint

-- Positionen aus Phase 2: Art «position», Einheit «Stk.», MWST-Satz des Belegs je Zeile
UPDATE "angebot" b SET "positionen" = (
  SELECT COALESCE(jsonb_agg(CASE WHEN e ? 'art' THEN e ELSE e || jsonb_build_object('art', 'position', 'einheit', 'Stk.', 'mwstSatz', b."mwst_satz") END ORDER BY o), '[]'::jsonb)
  FROM jsonb_array_elements(b."positionen") WITH ORDINALITY AS t(e, o))
 WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(b."positionen") x WHERE NOT x ? 'art');
--> statement-breakpoint
UPDATE "auftrag" b SET "positionen" = (
  SELECT COALESCE(jsonb_agg(CASE WHEN e ? 'art' THEN e ELSE e || jsonb_build_object('art', 'position', 'einheit', 'Stk.', 'mwstSatz', b."mwst_satz") END ORDER BY o), '[]'::jsonb)
  FROM jsonb_array_elements(b."positionen") WITH ORDINALITY AS t(e, o))
 WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(b."positionen") x WHERE NOT x ? 'art');
--> statement-breakpoint
UPDATE "rechnung" b SET "positionen" = (
  SELECT COALESCE(jsonb_agg(CASE WHEN e ? 'art' THEN e ELSE e || jsonb_build_object('art', 'position', 'einheit', 'Stk.', 'mwstSatz', b."mwst_satz") END ORDER BY o), '[]'::jsonb)
  FROM jsonb_array_elements(b."positionen") WITH ORDINALITY AS t(e, o))
 WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(b."positionen") x WHERE NOT x ? 'art');
--> statement-breakpoint

-- Mahnungen
CREATE TABLE IF NOT EXISTS "mahnung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rechnung_id" uuid NOT NULL REFERENCES "rechnung"("id") ON DELETE CASCADE,
	"stufe" integer NOT NULL,
	"nummer" text NOT NULL UNIQUE,
	"datum" timestamp with time zone DEFAULT now() NOT NULL,
	"frist_bis" timestamp with time zone NOT NULL,
	"gebuehr_rp" integer DEFAULT 0 NOT NULL,
	"offen_rp" integer NOT NULL,
	"sprache" text DEFAULT 'de' NOT NULL,
	"versendet_am" timestamp with time zone,
	"versendet_an" text,
	"erstellt_von" uuid,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mahnung_rechnung_idx" ON "mahnung" ("rechnung_id", "stufe");
--> statement-breakpoint

-- Versionen von Angebot und Rechnung
CREATE TABLE IF NOT EXISTS "beleg_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"art" text NOT NULL,
	"beleg_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"grund" text DEFAULT 'manuell' NOT NULL,
	"daten" jsonb NOT NULL,
	"total_rp" integer DEFAULT 0 NOT NULL,
	"erstellt_von" uuid,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "beleg_version_beleg_idx" ON "beleg_version" ("beleg_id", "version");
--> statement-breakpoint

-- Produktkatalog
CREATE TABLE IF NOT EXISTS "produkt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kategorie" text DEFAULT 'massanzug' NOT NULL,
	"beschreibung" text,
	"preis_rp" integer DEFAULT 0 NOT NULL,
	"mwst_satz" numeric(4, 2) DEFAULT 8.1 NOT NULL,
	"einheit" text DEFAULT 'Stk.' NOT NULL,
	"varianten" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"aktiv" boolean DEFAULT true NOT NULL,
	"bild" bytea,
	"bild_typ" text,
	"bild_pfad" text,
	"sortierung" integer DEFAULT 0 NOT NULL,
	"katalog_id" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "produkt_kategorie_idx" ON "produkt" ("kategorie", "sortierung");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "produkt_aktiv_idx" ON "produkt" ("aktiv");
--> statement-breakpoint

-- Bestehende Preisliste (firma_einstellung «katalog») übernehmen …
INSERT INTO "produkt" ("name", "kategorie", "beschreibung", "preis_rp", "einheit", "sortierung", "katalog_id")
SELECT e->>'bezeichnung',
       CASE WHEN e->>'kategorie' IN ('massanzug','sakko','hose','weste','hemd','smoking','mantel','aenderung','stoffzuschlag','accessoire','dienstleistung') THEN e->>'kategorie' ELSE 'dienstleistung' END,
       NULLIF(e->>'beschreibung', ''),
       COALESCE((e->>'preisRp')::int, 0),
       'Stk.',
       o::int * 10,
       e->>'id'
  FROM "firma_einstellung" f, jsonb_array_elements(f."wert") WITH ORDINALITY AS t(e, o)
 WHERE f."schluessel" = 'katalog' AND jsonb_typeof(f."wert") = 'array' AND COALESCE(e->>'bezeichnung', '') <> ''
   AND NOT EXISTS (SELECT 1 FROM "produkt");
--> statement-breakpoint
-- … sonst die Standard-Preisliste des Ateliers (Massanzug mit Stoffqualitäten als Varianten)
INSERT INTO "produkt" ("name", "kategorie", "beschreibung", "preis_rp", "einheit", "varianten", "sortierung", "katalog_id")
SELECT v.name, v.kategorie, v.beschreibung, v.preis, 'Stk.', v.varianten::jsonb, v.sortierung, v.katalog_id
  FROM (VALUES
    ('Massanzug zweiteilig', 'massanzug', 'Sakko und Hose, Full-Canvas, Made in Italy', 169000,
      '[{"id":"super-110","name":"Super 110","preisRp":169000,"aktiv":true},{"id":"super-130","name":"Super 130","preisRp":189000,"aktiv":true},{"id":"super-150","name":"Super 150","preisRp":219000,"aktiv":true},{"id":"super-180","name":"Super 180","preisRp":259000,"aktiv":true}]', 10, 'massanzug-2'),
    ('Massanzug dreiteilig', 'massanzug', 'Sakko, Hose und Weste, Full-Canvas, Made in Italy', 0, '[]', 20, 'massanzug-3'),
    ('Smoking nach Mass', 'smoking', 'Mit Satin-Revers', 0, '[]', 30, 'smoking'),
    ('Sakko nach Mass', 'sakko', NULL, 0, '[]', 40, 'sakko'),
    ('Hose nach Mass', 'hose', NULL, 0, '[]', 50, 'hose'),
    ('Weste nach Mass', 'weste', NULL, 0, '[]', 60, 'weste'),
    ('Hemd nach Mass', 'hemd', NULL, 0, '[]', 70, 'hemd'),
    ('Mantel nach Mass', 'mantel', NULL, 0, '[]', 80, 'mantel'),
    ('Stoffzuschlag', 'stoffzuschlag', 'Premium-Stoff', 0, '[]', 90, 'stoffzuschlag'),
    ('Änderungen', 'aenderung', NULL, 0, '[]', 100, 'aenderung')
  ) AS v(name, kategorie, beschreibung, preis, varianten, sortierung, katalog_id)
 WHERE NOT EXISTS (SELECT 1 FROM "produkt");
