import '@seed-design/css/base.css';
import '@yapp-plus/ui/fonts.css';
import { seedThemeScript } from '@yapp-plus/ui/seed-theme';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './global.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'YAPP+',
  description: 'YAPP+ web application',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ko"
      data-seed=""
      data-seed-color-mode="system"
      data-seed-user-color-scheme="light"
      suppressHydrationWarning
    >
      <head>
        <script id="seed-theme" dangerouslySetInnerHTML={{ __html: seedThemeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
