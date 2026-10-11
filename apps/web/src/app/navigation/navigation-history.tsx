'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { observeBrowserHistory } from './browser-history';

const HistoryContext = createContext<{ current: () => boolean }>({ current: () => false });

export function NavigationHistory({ children }: { children: ReactNode }) {
  const canGoBack = useRef<() => boolean>(() => false);

  useEffect(() => {
    const observer = observeBrowserHistory(window);
    canGoBack.current = observer.canGoBack;
    return () => {
      canGoBack.current = () => false;
      observer.dispose();
    };
  }, []);

  return <HistoryContext value={canGoBack}>{children}</HistoryContext>;
}

export function useCanGoBack() {
  return useContext(HistoryContext);
}
