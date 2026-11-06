'use client';
// Einwilligung als eigener Schalter (role="switch") statt nativer Checkbox. Optional, Standard aus.
import './formular.css';

export function Einwilligung({ id, an, setAn, text, hinweis }: {
  id: string; an: boolean; setAn: (v: boolean) => void; text: string; hinweis?: string;
}) {
  return (
    <button type="button" id={id} role="switch" aria-checked={an} className="einw" onClick={() => setAn(!an)}>
      <span className="einw__schalter" aria-hidden="true" />
      <span className="einw__text">
        <span>{text}</span>
        {hinweis && <small>{hinweis}</small>}
      </span>
    </button>
  );
}
