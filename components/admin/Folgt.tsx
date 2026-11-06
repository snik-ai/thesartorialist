// Platzhalter für Phase 2 (Datenmodell steht, Ausbau folgt).
export default function Folgt({ titel, text }: { titel: string; text: string }) {
  return (
    <>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Atelier</span>
          <h1>{titel}</h1>
        </div>
      </div>
      <div className="a-karte a-folgt">
        <span className="a-pill ohne">folgt</span>
        <h2>{titel} kommen im nächsten Schritt</h2>
        <p>{text}</p>
      </div>
    </>
  );
}
