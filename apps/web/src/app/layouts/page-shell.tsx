import type { ReactNode } from 'react';
import { header, shell, shellWithNavigation, wordmark } from './page-shell.css';

export function PageShell({
  children,
  navigation,
}: {
  children: ReactNode;
  navigation?: ReactNode;
}) {
  return (
    <div className={navigation ? shellWithNavigation : shell}>
      <header className={header}>
        <span className={wordmark}>YAPP+</span>
      </header>
      {children}
      {navigation}
    </div>
  );
}
