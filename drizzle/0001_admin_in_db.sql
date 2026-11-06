-- Admins stehen in der Datenbank (statt ADMIN_EMAILS). Erste Admins werden angelegt.
ALTER TABLE "admin_user" ADD COLUMN IF NOT EXISTS "aktiv" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
INSERT INTO "admin_user" ("email") VALUES ('store@thesartorialist.ch'), ('s.nikolic@dlm-digital.ch') ON CONFLICT ("email") DO UPDATE SET "aktiv" = true;
