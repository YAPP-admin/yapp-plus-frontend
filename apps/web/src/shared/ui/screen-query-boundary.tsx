/** 수동 재시도가 Query 오류 복구 경로를 사용하게 합니다. */
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { LocalErrorBoundary } from './local-error-boundary';

/**
 * 오류 UI는 호출자가 정하며, 재시도나 대상 변경 전까지 fallback을 유지합니다.
 */
export function ScreenQueryBoundary({
  children,
  renderFallback,
}: {
  children: ReactNode;
  renderFallback: (props: FallbackProps) => ReactNode;
}) {
  return <LocalErrorBoundary fallbackRender={renderFallback}>{children}</LocalErrorBoundary>;
}
