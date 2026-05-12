import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ALL ROADS — Logística empresarial',
  description: 'Plataforma SaaS modular de gestión operativa y logística',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
