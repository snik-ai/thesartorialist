// DLM-Pixel: Lead-Meldung Server→Server (Vertrag v2, §2). Fire-and-forget, nie blockierend,
// nie Personendaten im Label. Ohne DLM_PX_TOKEN wird nichts gesendet.
export async function reportDlmLead(input: { kind: string; path?: string; sid?: string; label?: string }) {
  const token = process.env.DLM_PX_TOKEN;
  if (!token) return;
  try {
    await fetch('https://dlm-digital.ch/api/px/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.warn('[dlm-px] lead report failed', err);
  }
}
