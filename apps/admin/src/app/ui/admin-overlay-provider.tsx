import { useLocation } from '@tanstack/react-router';
import { Portal, Snackbar } from '@seed-design/react';
import { OverlayProvider } from 'overlay-kit';
import type { ReactNode } from 'react';

/** 페이지가 바뀌면 열린 모달과 입력 초안을 함께 제거합니다. */
export function AdminOverlayProvider({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <Snackbar.RootProvider key={pathname}>
      <OverlayProvider>{children}</OverlayProvider>
      <Portal>
        <Snackbar.Region aria-label="어드민 알림" data-seed-color-mode="dark-only">
          <Snackbar.Renderer />
        </Snackbar.Region>
      </Portal>
    </Snackbar.RootProvider>
  );
}

/** 세션 경로에서 기수를 바꾸면 열린 모달과 입력 초안을 함께 제거합니다. */
export function SessionGenerationOverlayProvider({
  generationId,
  children,
}: {
  generationId: number;
  children: ReactNode;
}) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const lifecycleKey = pathname === '/sessions' ? `${pathname}:${generationId}` : pathname;

  return (
    <Snackbar.RootProvider key={lifecycleKey}>
      <OverlayProvider>{children}</OverlayProvider>
      <Portal>
        <Snackbar.Region aria-label="어드민 알림" data-seed-color-mode="dark-only">
          <Snackbar.Renderer />
        </Snackbar.Region>
      </Portal>
    </Snackbar.RootProvider>
  );
}
