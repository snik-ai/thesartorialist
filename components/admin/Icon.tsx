// Schlanke Linien-Icons fürs Backend (inline SVG, keine Bibliothek).
const PFADE: Record<string, React.ReactNode> = {
  kalender: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="1" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  kontakte: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.8a3.3 3.3 0 0 1 0 6.4M18.5 14.6c1.6.8 2.6 2.6 3 5.4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 20h18" />
      <path d="M4 15l4.5-5 4 3L20 5" />
      <circle cx="20" cy="5" r="1.4" />
    </>
  ),
  dokument: (
    <>
      <path d="M6 2.5h8l4 4V21H6z" />
      <path d="M14 2.5V7h4M9 12h6M9 16h6" />
    </>
  ),
  auftrag: (
    <>
      <path d="M4 7h16v13H4z" />
      <path d="M9 7V4h6v3M4 12h16" />
    </>
  ),
  rechnung: (
    <>
      <path d="M5 2.5h14v19l-3-2-2 2-2-2-2 2-2-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  mass: (
    <>
      <path d="M2.5 15.5l13-13 6 6-13 13z" />
      <path d="M7 11l2 2M10 8l2 2M13 5l2 2" />
    </>
  ),
  einstellungen: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </>
  ),
  telefon: <path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 5.2 5.2l1.4-2.1 4.2 1.6V17a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2z" />,
  whatsapp: (
    <>
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.3z" />
      <path d="M9 8.5c0 3.2 2.9 6.2 6.2 6.5l1.3-1.6-2-1-1 .9c-1-.4-2.3-1.6-2.7-2.7l.9-1-1-2z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3.5 6l8.5 7 8.5-7" />
    </>
  ),
  sms: (
    <>
      <path d="M4 4.5h16v11H9l-5 4z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.4" />
    </>
  ),
  notiz: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  formular: (
    <>
      <path d="M5 3h14v18H5z" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </>
  ),
  system: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pfeilLinks: <path d="M15 5l-7 7 7 7" />,
  pfeilRechts: <path d="M9 5l7 7-7 7" />,
  zurueck: <path d="M19 12H5M11 6l-6 6 6 6" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  suche: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  faceid: (
    <>
      <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
      <path d="M8.5 9v1.5M15.5 9v1.5M12 9v4h-1M9 16a4.5 4.5 0 0 0 6 0" />
    </>
  ),
  abmelden: <path d="M9 4H5v16h4M15 8l4 4-4 4M19 12H9" />,
  glocke: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  teilen: (
    <>
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5v10h14V11h-1" />
    </>
  ),
  plusquadrat: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  merge: <path d="M6 3v6a6 6 0 0 0 6 6h6M6 21v-6M15 12l3 3-3 3" />,
  mehr: (
    <>
      <circle cx="5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="19" cy="12" r="1.3" />
    </>
  ),
  route: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
};

export default function Icon({ name, ...rest }: { name: keyof typeof PFADE | string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {PFADE[name] ?? PFADE.system}
    </svg>
  );
}
