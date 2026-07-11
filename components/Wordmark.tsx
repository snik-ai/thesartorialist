// Original-Logo (schwarz auf transparent); im Footer via CSS invertiert.
export default function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <img
      src="/images/sartorialist-zurich-logo.png"
      alt="The Sartorialist Zürich"
      width={600}
      height={89}
      className={`logo${light ? ' logo--light' : ''}`}
    />
  );
}
