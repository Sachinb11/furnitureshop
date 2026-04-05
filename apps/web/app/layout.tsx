import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  title: {
    default:  'Furnishop — Quality furniture for every home',
    template: '%s | Furnishop',
  },
  description:
    'Shop thousands of furniture pieces delivered across India. Sofas, beds, dining tables, storage and more.',
  keywords: ['furniture', 'sofa', 'bed', 'dining table', 'home decor', 'India'],
  openGraph: { type: 'website', siteName: 'Furnishop', locale: 'en_IN' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
