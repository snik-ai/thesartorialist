// Original-Logo (schwarz auf transparent); im Footer via CSS invertiert.
export default function Wordmark({ light = false, alt = 'The Sartorialist Zürich' }: { light?: boolean; alt?: string }) {
  return (
    <img
      src="/images/sartorialist-zurich-logo.png"
      alt={alt}
      width={600}
      height={89}
      className={`logo${light ? ' logo--light' : ''}`}
    />
  );
}
