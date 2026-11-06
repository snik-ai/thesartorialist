'use client';
// Gemeinsamer Aufruf der Admin-APIs: Ladezustand, Meldung (grün/rot), danach Server-Daten neu laden.
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

export type Meldung = { art: 'gruen' | 'rot'; text: string } | null;

export function useAktion() {
  const router = useRouter();
  const [laedt, setLaedt] = useState(false);
  const [meldung, setMeldung] = useState<Meldung>(null);

  const senden = useCallback(
    async <T = Record<string, unknown>>(url: string, body?: unknown, methode: 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST', o: { still?: boolean; ohneRefresh?: boolean } = {}): Promise<(T & { ok: true }) | null> => {
      setLaedt(true);
      if (!o.still) setMeldung(null);
      try {
        const r = await fetch(url, { method: methode, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.fehler || 'Das hat nicht geklappt.');
        if (!o.still) setMeldung({ art: j.mailFehler ? 'rot' : 'gruen', text: j.meldung || 'Gespeichert.' });
        if (!o.ohneRefresh) router.refresh();
        return j as T & { ok: true };
      } catch (e) {
        setMeldung({ art: 'rot', text: (e as Error).message });
        return null;
      } finally {
        setLaedt(false);
      }
    },
    [router],
  );

  return { laedt, meldung, setMeldung, senden };
}

export function MeldungZeile({ m }: { m: Meldung }) {
  if (!m) return null;
  return (
    <div className={`a-hinweis ${m.art}`} role={m.art === 'rot' ? 'alert' : 'status'}>
      {m.text}
    </div>
  );
}
