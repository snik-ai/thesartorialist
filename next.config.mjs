/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reine Marketing-Site ohne Backend: statischer Export für schnellste
  // HTML-Auslieferung. Terminbuchung läuft über tel:/mailto: — keine API nötig.
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
