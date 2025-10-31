import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers as AppProviders } from './providers';
import { ThemeAndQueryProviders } from '@/components/theme-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fulfillment Dashboard',
  description: 'Manage and fulfill orders efficiently',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          <ThemeAndQueryProviders>{children}</ThemeAndQueryProviders>
        </AppProviders>
      </body>
    </html>
  );
}
