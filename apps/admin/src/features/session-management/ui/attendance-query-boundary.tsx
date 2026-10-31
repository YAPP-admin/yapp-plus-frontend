import { createContext, Suspense, useContext, type ReactNode } from 'react';
import { CatchBoundary, ClientOnly } from '@tanstack/react-router';
import { QueryErrorResetBoundary, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ActionButton } from '@yapp-plus/ui';

const AttendanceQueryErrorMessage = createContext('출석 정보를 불러오지 못했습니다.');

/** 출석 조회의 로딩·오류·재시도 상태를 조회 컴포넌트와 분리한다. */
export function AttendanceQueryBoundary({
  children,
  fallback,
  errorMessage = '출석 정보를 불러오지 못했습니다.',
  resetKey = 'attendance-query',
}: {
  children: ReactNode;
  fallback: ReactNode;
  errorMessage?: string;
  resetKey?: string;
}) {
  return (
    <ClientOnly fallback={fallback}>
      <QueryErrorResetBoundary>
        <AttendanceQueryErrorMessage.Provider value={errorMessage}>
          <CatchBoundary getResetKey={() => resetKey} errorComponent={AttendanceQueryError}>
            <Suspense fallback={fallback}>{children}</Suspense>
          </CatchBoundary>
        </AttendanceQueryErrorMessage.Provider>
      </QueryErrorResetBoundary>
    </ClientOnly>
  );
}

function AttendanceQueryError({ reset }: { reset: () => void }) {
  const query = useQueryErrorResetBoundary();
  const message = useContext(AttendanceQueryErrorMessage);

  return (
    <div role="alert">
      <p>{message}</p>
      <ActionButton
        variant="neutralWeak"
        size="small"
        type="button"
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
