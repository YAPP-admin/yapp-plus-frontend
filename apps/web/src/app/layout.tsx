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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
