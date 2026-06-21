import { baseUrl, createMetadata } from '@/lib/metadata';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './global.css';

export const metadata = createMetadata({
  title: {
    template: '%s | Class Variance Builder',
    default: 'Class Variance Builder',
  },
  description:
    'Universal, lightweight and performant styling solution with a focus on component architecture for the modern web',
  metadataBase: baseUrl,
});

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const mono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#fff' },
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
