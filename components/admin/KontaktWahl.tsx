'use client';
// Kontakt suchen und zu einer Seite springen (z. B. neues Massblatt) — eigenes Auswahl-Panel mit Suche.
import { useRouter } from 'next/navigation';
import Auswahl, { type Option } from './Auswahl';

export default function KontaktWahl({ optionen, ziel, platzhalter }: { optionen: Option[]; ziel: string; platzhalter: string }) {
  const router = useRouter();
  return <Auswahl optionen={optionen} wert={null} onChange={(v) => v && router.push(`${ziel}${v}`)} platzhalter={platzhalter} suche />;
}
