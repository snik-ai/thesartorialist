-- Zahlungsbedingungen schon im Angebot (für den Kunden sichtbar, bei Annahme in den Auftrag übernommen). Idempotent.
ALTER TABLE "angebot" ADD COLUMN IF NOT EXISTS "zahlungsplan" jsonb;
