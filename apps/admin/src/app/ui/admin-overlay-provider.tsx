/** 페이지가 바뀌면 열린 모달과 입력 초안을 함께 제거합니다. */
import { useLocation } from '@tanstack/react-router';
import { OverlayProvider } from 'overlay-kit';
import type { ReactNode } from 'react';

export function AdminOverlayProvider({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: (location) => location.pathname });

  return <OverlayProvider key={pathname}>{children}</OverlayProvider>;
}
