/// <reference types="vite/client" />

import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router';
import '@seed-design/css/base.css';
import { seedThemeScript } from '@yapp-plus/ui/seed-theme';
import '@yapp-plus/ui/styles';
import type { ReactNode } from 'react';
import { Providers } from '~/providers';
import { brand, header, navigation, navigationLink, shell } from './__root.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'color-scheme', content: 'light dark' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'YAPP+ Admin' },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
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
        <HeadContent />
      </head>
      <body>
        <Providers>
          <div className={shell}>
            <header className={header}>
              <Link className={brand} to="/">
                YAPP+ Admin
              </Link>
              <nav className={navigation} aria-label="주요 메뉴">
                <Link className={navigationLink} to="/">
                  대시보드
                </Link>
              </nav>
            </header>
            {children}
          </div>
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
