-- Zahlungsplan je Auftrag (ganz oder in Raten, lib/crm/zahlungsplan.ts). Idempotent.
ALTER TABLE "auftrag" ADD COLUMN IF NOT EXISTS "zahlungsplan" jsonb;
