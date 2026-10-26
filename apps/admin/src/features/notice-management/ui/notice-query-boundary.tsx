/** 모의 조회의 실행 환경과 최초 로딩·오류·재시도를 화면 바깥에서 관리한다. */
import { Suspense, type ReactNode } from 'react';
import { CatchBoundary, ClientOnly } from '@tanstack/react-router';
import { QueryErrorResetBoundary, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ActionButton } from '@yapp-plus/ui';

/** 서버와 프로덕션에서는 조회 컴포넌트를 마운트하지 않는다. */
export function NoticeQueryBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  if (!import.meta.env.DEV) {
    return <p>공지 관리 기능을 준비 중입니다.</p>;
  }

  return (
    <ClientOnly fallback={fallback}>
      <QueryErrorResetBoundary>
        <CatchBoundary getResetKey={() => 'notice-query'} errorComponent={NoticeQueryError}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </CatchBoundary>
      </QueryErrorResetBoundary>
    </ClientOnly>
  );
}

/** Query 오류와 렌더링 오류 경계를 함께 초기화하여 조회를 다시 시작한다. */
function NoticeQueryError({ reset }: { reset: () => void }) {
  const query = useQueryErrorResetBoundary();

  return (
    <div role="alert">
      <p>공지 정보를 불러오지 못했습니다.</p>

      <ActionButton
        variant="neutralWeak"
        onClick={() => {
          query.reset();
          reset();
        }}
      >
        다시 시도
      </ActionButton>
    </div>
  );
}
