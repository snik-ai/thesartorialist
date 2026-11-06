'use client';
// Anmeldung: E-Mail → 6-stelliger Code, oder direkt mit Face ID / Passkey (auch als Autofill im E-Mail-Feld).
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserSupportsWebAuthn, browserSupportsWebAuthnAutofill } from '@simplewebauthn/browser';
import Icon from '@/components/admin/Icon';
import { passkeyAnmelden, passkeyBekannt, plattform } from '@/lib/admin/passkey-geraet';

export default function LoginForm({ weiter }: { weiter: string }) {
  const router = useRouter();
  const [schritt, setSchritt] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState('');
  const [pk, setPk] = useState<{ moeglich: boolean; bekannt: boolean; methode: string }>({ moeglich: false, bekannt: false, methode: 'Face ID' });
  const codeRef = useRef<HTMLInputElement>(null);

  const fertig = () => {
    router.replace(weiter);
    router.refresh();
  };

  useEffect(() => {
    if (!browserSupportsWebAuthn()) return;
    const p = plattform();
    setPk({ moeglich: true, bekannt: passkeyBekannt(), methode: p.methode });
    let aus = false;
    // Autofill: der Browser schlägt den Passkey direkt im E-Mail-Feld vor
    browserSupportsWebAuthnAutofill().then((ok) => {
      if (!ok || aus) return;
      passkeyAnmelden(true)
        .then(() => !aus && fertig())
        .catch(() => {});
    });
    return () => {
      aus = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function mitPasskey() {
    setFehler('');
    setLaedt(true);
    try {
      await passkeyAnmelden(false);
      fertig();
    } catch (e) {
      const n = (e as { name?: string }).name;
      if (n !== 'NotAllowedError' && n !== 'AbortError') setFehler((e as Error).message || 'Anmeldung fehlgeschlagen.');
    } finally {
      setLaedt(false);
    }
  }

  async function codeAnfordern(e?: React.FormEvent) {
    e?.preventDefault();
    setFehler('');
    setLaedt(true);
    try {
      const r = await fetch('/api/login/code/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fehler || 'Fehler');
      setDevCode(j.devCode || '');
      setSchritt('code');
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch (e) {
      setFehler((e as Error).message);
    } finally {
      setLaedt(false);
    }
  }

  async function pruefen(wert = code) {
    if (wert.length !== 6) return;
    setFehler('');
    setLaedt(true);
    try {
      const r = await fetch('/api/login/pruefen/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code: wert }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fehler || 'Fehler');
      fertig();
    } catch (e) {
      setFehler((e as Error).message);
      setCode('');
      setLaedt(false);
    }
  }

  if (schritt === 'code') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          pruefen();
        }}
      >
        <p className="a-sub" style={{ marginTop: -10, marginBottom: 18 }}>
          Wir haben einen 6-stelligen Code an <b style={{ color: 'var(--a-ink)' }}>{email}</b> geschickt (falls die Adresse freigeschaltet ist).
        </p>
        <label className="a-feld">
          <span>Code</span>
          <input
            ref={codeRef}
            className="a-input code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(v);
              if (v.length === 6) pruefen(v);
            }}
            aria-describedby="code-hilfe"
          />
        </label>
        {devCode && (
          <p className="a-hinweis" id="code-hilfe" style={{ marginBottom: 14 }}>
            Lokal ohne Mailversand: Code <b className="zahl">{devCode}</b>
          </p>
        )}
        {fehler && (
          <p className="a-hinweis rot" role="alert" style={{ marginBottom: 14 }}>
            {fehler}
          </p>
        )}
        <button type="submit" className="a-knopf voll" disabled={laedt || code.length !== 6}>
          {laedt ? 'Prüfe …' : 'Anmelden'}
        </button>
        <div className="a-knopfreihe" style={{ marginTop: 12, justifyContent: 'space-between' }}>
          <button type="button" className="a-knopf leise klein" onClick={() => setSchritt('email')}>
            Andere E-Mail
          </button>
          <button type="button" className="a-knopf leise klein" onClick={() => codeAnfordern()} disabled={laedt}>
            Neuen Code senden
          </button>
        </div>
      </form>
    );
  }

  const passkeyKnopf = pk.moeglich && (
    <button type="button" className={`a-knopf voll ${pk.bekannt ? '' : 'linie'}`} onClick={mitPasskey} disabled={laedt}>
      <Icon name="faceid" />
      Mit {pk.methode} anmelden
    </button>
  );

  return (
    <form onSubmit={codeAnfordern}>
      {pk.bekannt && (
        <>
          {passkeyKnopf}
          <div className="a-trenner">oder mit Code</div>
        </>
      )}
      <label className="a-feld">
        <span>E-Mail</span>
        <input
          className="a-input"
          type="email"
          inputMode="email"
          autoComplete="username webauthn"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
        />
      </label>
      {fehler && (
        <p className="a-hinweis rot" role="alert" style={{ marginBottom: 14 }}>
          {fehler}
        </p>
      )}
      <button type="submit" className="a-knopf voll" disabled={laedt}>
        {laedt ? 'Moment …' : 'Code per E-Mail senden'}
      </button>
      {!pk.bekannt && pk.moeglich && (
        <>
          <div className="a-trenner">oder</div>
          {passkeyKnopf}
        </>
      )}
    </form>
  );
}
