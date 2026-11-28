/** 뒤풀이 화면의 접근 조건과 Suspense·Query 오류 복구를 연결합니다. */
import { Suspense, type ReactNode } from 'react';
import { type FallbackProps } from 'react-error-boundary';
import { LocalErrorBoundary } from '@/shared/ui/local-error-boundary';
import { useDiningAccess } from '../model/dining-query';
import { DiningQueryState } from './dining-query-state';
import { DiningDetailLoading, DiningListLoading } from './dining-loading';

const renderDiningError = ({ resetErrorBoundary }: FallbackProps) => (
  <DiningQueryState message="뒤풀이 정보를 불러오지 못했어요." onRetry={resetErrorBoundary} />
);

/** 조회 가능한 화면만 마운트하고 실패 재시도는 화면 경계에서 처리합니다. */
export function DiningQueryBoundary({
  children,
  diningId,
}: {
  children: ReactNode;
  diningId?: string;
}) {
  const { canQuery } = useDiningAccess();
  if (
    diningId !== undefined &&
    (!/^\d+$/.test(diningId) || !Number.isSafeInteger(Number(diningId)) || Number(diningId) <= 0)
  ) {
    return <DiningQueryState message="뒤풀이를 찾을 수 없어요." />;
  }
  if (!canQuery) {
    return <DiningQueryState message="YAPP+ 앱에 로그인한 후 뒤풀이를 확인할 수 있어요." />;
  }
  return (
    <LocalErrorBoundary key={diningId} fallbackRender={renderDiningError}>
      <Suspense fallback={diningId === undefined ? <DiningListLoading /> : <DiningDetailLoading />}>
        {children}
      </Suspense>
    </LocalErrorBoundary>
  );
}
