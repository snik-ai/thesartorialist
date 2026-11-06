CREATE TABLE "admin_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"fehlversuche" integer DEFAULT 0 NOT NULL,
	"gesperrt_bis" timestamp with time zone,
	"letzte_anmeldung" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "aktivitaet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kontakt_id" uuid NOT NULL,
	"termin_id" uuid,
	"kanal" text NOT NULL,
	"richtung" text DEFAULT 'intern' NOT NULL,
	"titel" text NOT NULL,
	"text" text,
	"daten" jsonb,
	"admin_user_id" uuid,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "angebot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kontakt_id" uuid,
	"termin_id" uuid,
	"nummer" text,
	"status" text DEFAULT 'entwurf' NOT NULL,
	"positionen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_rp" integer DEFAULT 0 NOT NULL,
	"gueltig_bis" timestamp with time zone,
	"notiz" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "angebot_nummer_unique" UNIQUE("nummer")
);
--> statement-breakpoint
CREATE TABLE "auftrag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kontakt_id" uuid,
	"angebot_id" uuid,
	"nummer" text,
	"status" text DEFAULT 'offen' NOT NULL,
	"positionen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_rp" integer DEFAULT 0 NOT NULL,
	"liefertermin" timestamp with time zone,
	"notiz" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auftrag_nummer_unique" UNIQUE("nummer")
);
--> statement-breakpoint
CREATE TABLE "ereignis" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"zeit" timestamp with time zone DEFAULT now() NOT NULL,
	"typ" text NOT NULL,
	"pfad" text NOT NULL,
	"referrer" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"geraet" text,
	"sprache" text,
	"besucher" text NOT NULL,
	"label" text
);
--> statement-breakpoint
CREATE TABLE "kontakt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email" text,
	"telefon" text,
	"telefon_norm" text,
	"firma" text,
	"brand_domain" text,
	"sprache" text DEFAULT 'de' NOT NULL,
	"quelle" text,
	"notiz" text,
	"einwilligung_whatsapp" timestamp with time zone,
	"einwilligung_whatsapp_quelle" text,
	"einwilligung_sms" timestamp with time zone,
	"einwilligung_sms_quelle" text,
	"abgemeldet" timestamp with time zone,
	"zusammengefuehrt_in" uuid,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"gueltig_bis" timestamp with time zone NOT NULL,
	"versuche" integer DEFAULT 0 NOT NULL,
	"verbraucht_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massblatt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kontakt_id" uuid NOT NULL,
	"auftrag_id" uuid,
	"masse" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"aktiv" boolean DEFAULT true NOT NULL,
	"notiz" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"credential_id" text NOT NULL,
	"public_key" "bytea" NOT NULL,
	"zaehler" bigint DEFAULT 0 NOT NULL,
	"transports" jsonb,
	"name" text,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"zuletzt_benutzt" timestamp with time zone,
	CONSTRAINT "passkey_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "passkey_challenge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge" text NOT NULL,
	"zweck" text NOT NULL,
	"admin_user_id" uuid,
	"gueltig_bis" timestamp with time zone NOT NULL,
	"verbraucht_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rechnung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kontakt_id" uuid,
	"auftrag_id" uuid,
	"nummer" text,
	"status" text DEFAULT 'entwurf' NOT NULL,
	"positionen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_rp" integer DEFAULT 0 NOT NULL,
	"faellig_am" timestamp with time zone,
	"bezahlt_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rechnung_nummer_unique" UNIQUE("nummer")
);
--> statement-breakpoint
CREATE TABLE "sitzung" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"methode" text NOT NULL,
	"user_agent" text,
	"gueltig_bis" timestamp with time zone NOT NULL,
	"zuletzt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sitzung_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "termin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kontakt_id" uuid NOT NULL,
	"art" text DEFAULT 'termin' NOT NULL,
	"status" text DEFAULT 'angefragt' NOT NULL,
	"wunsch_start" timestamp with time zone,
	"wunsch_text" text,
	"bestaetigt_start" timestamp with time zone,
	"vorschlaege" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stil" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stoffe" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quelle" text,
	"sprache" text DEFAULT 'de' NOT NULL,
	"eingang_mail_am" timestamp with time zone,
	"atelier_mail_am" timestamp with time zone,
	"gelesen_am" timestamp with time zone,
	"erstellt_am" timestamp with time zone DEFAULT now() NOT NULL,
	"aktualisiert_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aktivitaet" ADD CONSTRAINT "aktivitaet_kontakt_id_kontakt_id_fk" FOREIGN KEY ("kontakt_id") REFERENCES "public"."kontakt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aktivitaet" ADD CONSTRAINT "aktivitaet_termin_id_termin_id_fk" FOREIGN KEY ("termin_id") REFERENCES "public"."termin"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aktivitaet" ADD CONSTRAINT "aktivitaet_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "angebot" ADD CONSTRAINT "angebot_kontakt_id_kontakt_id_fk" FOREIGN KEY ("kontakt_id") REFERENCES "public"."kontakt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "angebot" ADD CONSTRAINT "angebot_termin_id_termin_id_fk" FOREIGN KEY ("termin_id") REFERENCES "public"."termin"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auftrag" ADD CONSTRAINT "auftrag_kontakt_id_kontakt_id_fk" FOREIGN KEY ("kontakt_id") REFERENCES "public"."kontakt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auftrag" ADD CONSTRAINT "auftrag_angebot_id_angebot_id_fk" FOREIGN KEY ("angebot_id") REFERENCES "public"."angebot"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massblatt" ADD CONSTRAINT "massblatt_kontakt_id_kontakt_id_fk" FOREIGN KEY ("kontakt_id") REFERENCES "public"."kontakt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "massblatt" ADD CONSTRAINT "massblatt_auftrag_id_auftrag_id_fk" FOREIGN KEY ("auftrag_id") REFERENCES "public"."auftrag"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey_challenge" ADD CONSTRAINT "passkey_challenge_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rechnung" ADD CONSTRAINT "rechnung_kontakt_id_kontakt_id_fk" FOREIGN KEY ("kontakt_id") REFERENCES "public"."kontakt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rechnung" ADD CONSTRAINT "rechnung_auftrag_id_auftrag_id_fk" FOREIGN KEY ("auftrag_id") REFERENCES "public"."auftrag"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sitzung" ADD CONSTRAINT "sitzung_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "termin" ADD CONSTRAINT "termin_kontakt_id_kontakt_id_fk" FOREIGN KEY ("kontakt_id") REFERENCES "public"."kontakt"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aktivitaet_kontakt_idx" ON "aktivitaet" USING btree ("kontakt_id","erstellt_am");--> statement-breakpoint
CREATE INDEX "ereignis_zeit_idx" ON "ereignis" USING btree ("zeit");--> statement-breakpoint
CREATE INDEX "ereignis_typ_zeit_idx" ON "ereignis" USING btree ("typ","zeit");--> statement-breakpoint
CREATE INDEX "kontakt_email_idx" ON "kontakt" USING btree ("email");--> statement-breakpoint
CREATE INDEX "kontakt_tel_idx" ON "kontakt" USING btree ("telefon_norm");--> statement-breakpoint
CREATE INDEX "login_code_email_idx" ON "login_code" USING btree ("email","erstellt_am");--> statement-breakpoint
CREATE UNIQUE INDEX "massblatt_aktiv_idx" ON "massblatt" USING btree ("kontakt_id") WHERE aktiv;--> statement-breakpoint
CREATE INDEX "termin_status_idx" ON "termin" USING btree ("status","erstellt_am");--> statement-breakpoint
CREATE INDEX "termin_kontakt_idx" ON "termin" USING btree ("kontakt_id");