-- Webseitenanalyse (wie Karo): Sitzung, Verweildauer, Kanal, Browser/OS, Land (Näherung), Bildschirm,
-- Sprache der Website, Seitentitel, UTM term/content, Google-Klickkennung (nur ja/nein). Idempotent.
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "utm_term" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "utm_content" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "gclid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "kanal" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "browser" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "os" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "bildschirm" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "land" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "land_quelle" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "seiten_sprache" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "titel" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "sitzung" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "aufruf" text;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "dauer_ms" integer;--> statement-breakpoint
ALTER TABLE "ereignis" ADD COLUMN IF NOT EXISTS "zuletzt" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ereignis_besucher_zeit_idx" ON "ereignis" USING btree ("besucher","zeit");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ereignis_aufruf_idx" ON "ereignis" USING btree ("aufruf");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ereignis_zuletzt_idx" ON "ereignis" USING btree ("zuletzt");--> statement-breakpoint
-- Bestehende Zeilen: Sitzung = Tages-Besucher (genauer geht es rückwirkend nicht), Sprache aus dem Pfad,
-- Kanal grob aus Referrer/UTM (neue Zeilen ordnet lib/tracking/server.ts → kanalVon zu).
UPDATE "ereignis" SET "sitzung" = 'alt' || "besucher" || to_char("zeit" at time zone 'Europe/Zurich', 'YYYYMMDD') WHERE "sitzung" IS NULL;--> statement-breakpoint
UPDATE "ereignis" SET "seiten_sprache" = CASE WHEN split_part("pfad", '/', 2) IN ('en','fr','it','es','pt-pt','ru','sr','sq') THEN split_part("pfad", '/', 2) ELSE 'de' END WHERE "seiten_sprache" IS NULL;--> statement-breakpoint
UPDATE "ereignis" SET "kanal" = CASE
  WHEN "utm_medium" ~* '^(cpc|ppc|paid|paidsearch|paid_search|sem|display|ads?)$' THEN CASE WHEN "utm_source" ~* 'google|adwords' THEN 'google_ads' ELSE 'werbung' END
  WHEN "utm_source" ~* 'chatgpt|openai|perplexity|claude|gemini|copilot' OR "referrer" ~* '(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$' THEN 'ki'
  WHEN "utm_medium" ~* '^(e-?mail|newsletter)$' OR "utm_source" ~* 'newsletter' THEN 'email'
  WHEN "referrer" ~* '(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$' THEN 'google_seo'
  WHEN "referrer" ~* '(bing\.com|duckduckgo\.com|yahoo\.com|ecosia\.org|search\.ch|startpage\.com|brave\.com|qwant\.com)$' THEN 'suchmaschinen'
  WHEN "referrer" ~* '(facebook\.com|instagram\.com|linkedin\.com|lnkd\.in|t\.co|x\.com|twitter\.com|youtube\.com|tiktok\.com|pinterest\.[a-z]+|reddit\.com)$' OR "utm_source" ~* 'facebook|instagram|linkedin|tiktok|youtube|pinterest' THEN 'social'
  WHEN "referrer" IS NOT NULL THEN 'verweis'
  WHEN "utm_source" IS NOT NULL THEN 'kampagne'
  ELSE 'direkt' END
WHERE "kanal" IS NULL;
