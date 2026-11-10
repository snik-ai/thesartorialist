import type { Metadata } from 'next';
import Widget from '@/components/admin/Widget';
import './widget.css';

// Schreibtisch-Widget der Mac-App (desktop/, Fenster «widget»): kompakte Kennzahlen, Klick öffnet die Seite im Hauptfenster.
// Die Seite selbst enthält keine Daten (Middleware lässt sie ohne Cookie durch); die Kennzahlen kommen aus
// /api/admin/widget/ und nur mit gültiger Admin-Sitzung.
export const metadata: Metadata = { title: 'Widget' };

export default function WidgetSeite() {
  return <Widget />;
}
