// E-Mail-Versand über Resend (REST, ohne SDK). Konfiguration über Umgebungsvariablen:
//   RESEND_API_KEY  – API-Schlüssel aus resend.com (nur in Coolify, nie im Repo)
//   MAIL_FROM       – Absender, Domain muss in Resend verifiziert sein,
//                     z. B. «The Sartorialist Zürich <anfrage@thesartorialist.ch>»
//   MAIL_TO         – Empfänger der Anfragen (Standard: store@thesartorialist.ch)
import { SITE } from './site';

export const mailBereit = () => Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

export async function sendeMail(m: { to: string | string[]; subject: string; text: string; html: string; replyTo?: string; anhaenge?: { filename: string; content: string }[] }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: Array.isArray(m.to) ? m.to : [m.to],
      subject: m.subject,
      text: m.text,
      html: m.html,
      ...(m.replyTo ? { reply_to: m.replyTo } : {}),
      ...(m.anhaenge?.length ? { attachments: m.anhaenge } : {}),
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as { id: string };
}

export const empfaenger = () => process.env.MAIL_TO || SITE.email;
