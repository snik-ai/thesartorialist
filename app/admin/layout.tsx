import type { Metadata, Viewport } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Backend', template: '%s — Backend The Sartorialist' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Sartorialist', statusBarStyle: 'black-translucent' },
  alternates: { canonical: null },
  openGraph: null,
};

export const viewport: Viewport = {
  themeColor: '#101010',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
