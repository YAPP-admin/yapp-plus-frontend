import type { ReactNode } from 'react';
import { header, shell, wordmark } from './page-shell.css';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className={shell}>
      <header className={header}>
        <span className={wordmark}>YAPP+</span>
      </header>
      {children}
    </div>
  );
}
