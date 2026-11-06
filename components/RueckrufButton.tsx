'use client';

// Öffnet das schwebende Kontakt-Panel direkt im Rückruf-Formular.
export const RUECKRUF_EVENT = 'ts-rueckruf';

export default function RueckrufButton({ className = 'btn btn--ghost', children = 'Rückruf anfordern' }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" data-rueckruf className={className} onClick={() => window.dispatchEvent(new Event(RUECKRUF_EVENT))}>
      {children}
    </button>
  );
}
