/** 화면 복귀와 수동 재시도가 동일한 Query 오류 복구 경로를 사용하게 합니다. */
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useContext, useEffect, useRef, type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { ScreenActiveContext } from '../lib/screen-activity';

/**
 * 오류 UI는 호출자가 정하며, 정상 자식의 상태는 재생성하지 않습니다.
 * 탭 표시 시 Effect 재연결과 상세 화면 복귀 때만 오류 경계를 다시 엽니다.
 */
export function ScreenQueryBoundary({
  children,
  renderFallback,
}: {
  children: ReactNode;
  renderFallback: (props: FallbackProps) => ReactNode;
}) {
  const active = useContext(ScreenActiveContext);
  const boundary = useRef<ErrorBoundary>(null);

  useEffect(() => {
    if (active) {
      boundary.current?.resetErrorBoundary();
    }
  }, [active]);

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary ref={boundary} onReset={reset} fallbackRender={renderFallback}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
