'use client';
// Angebote nach der Anmeldung, nacheinander statt übereinander:
// 1. Benachrichtigungen aktivieren (Bottom-Sheet), 2. danach «Face ID einrichten?» (Banner).
import { useState } from 'react';
import PushAngebot from './PushAngebot';
import PasskeyAngebot from './PasskeyAngebot';

export default function NachLogin({ sitzung, passkeys, frisch }: { sitzung: string; passkeys: number; frisch: boolean }) {
  const [pushFertig, setPushFertig] = useState(false);
  return (
    <>
      <PushAngebot sitzung={sitzung} onFertig={() => setPushFertig(true)} />
      {pushFertig && <PasskeyAngebot anzahl={passkeys} frisch={frisch} />}
    </>
  );
}
