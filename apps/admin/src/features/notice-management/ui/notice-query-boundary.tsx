/** 공지 조회의 최초 로딩·오류·재시도를 화면 바깥에서 관리한다. */
import { Suspense, useEffect, type ReactNode } from 'react';
import { CatchBoundary, ClientOnly, useLocation, useNavigate } from '@tanstack/react-router';
import { QueryErrorResetBoundary, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ApiError } from '@yapp-plus/api';
import { ActionButton } from '@yapp-plus/ui';
import { clearAdminAccessToken } from '~/features/login';

/** 서버 렌더링에서는 조회 컴포넌트를 마운트하지 않는다. */
export function NoticeQueryBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
  notFoundMessage?: string;
}) {
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
function NoticeQueryError({ error, reset }: { error: unknown; reset: () => void }) {
  const query = useQueryErrorResetBoundary();
  const navigate = useNavigate();

  useEffect(() => {
    if (!(error instanceof ApiError) || error.status !== 404) {
      return;
    }

    void navigate({
      to: '/notices',
      search: { category: 'all', noticeError: 'not-found' },
      replace: true,
    });
  }, [error, navigate]);

  if (error instanceof ApiError && error.status === 404) {
    return null;
  }

  if (error instanceof ApiError && error.status === 401) {
    return <NoticeAuthenticationExpired />;
  }

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

function NoticeAuthenticationExpired() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    clearAdminAccessToken();
    void navigate({ to: '/login', search: { redirect: location.href }, replace: true });
  }, [location.href, navigate]);

  return null;
}
