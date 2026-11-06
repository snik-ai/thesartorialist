'use client';
// Rendert Inhalte der öffentlichen Website (Header, Footer, Kontakt-Knöpfe, Pixel, Tracking) nicht im Backend (/admin).
import { usePathname } from 'next/navigation';

export default function NurOeffentlich({ children }: { children: React.ReactNode }) {
  const pfad = usePathname() ?? '';
  if (pfad === '/admin' || pfad.startsWith('/admin/')) return null;
  return <>{children}</>;
}
