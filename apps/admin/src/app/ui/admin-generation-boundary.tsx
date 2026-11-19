/** 관리자 기수 조회의 초기화·오류·인증 만료를 작업 영역 바깥에서 처리한다. */
import { useEffect, type ReactNode } from 'react';
import { CatchBoundary, ClientOnly, Navigate, useNavigate } from '@tanstack/react-router';
import {
  QueryErrorResetBoundary,
  useQueryClient,
  useQueryErrorResetBoundary,
} from '@tanstack/react-query';
import { ApiError } from '@yapp-plus/api';
import { ActionButton } from '@yapp-plus/ui';
import { AdminGenerationProvider } from '~/features/admin-generation';
import { clearAdminAccessToken, readAdminAccessToken } from '~/features/login';

const INITIALIZATION_FALLBACK = <output>관리자 작업 영역을 준비하고 있습니다.</output>;

/** 서버에서는 fallback만 렌더링하고, 클라이언트에서만 인증된 기수 조회를 시작한다. */
export function AdminGenerationBoundary({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={INITIALIZATION_FALLBACK}>
      <AdminGenerationClientBoundary>{children}</AdminGenerationClientBoundary>
    </ClientOnly>
  );
}

function AdminGenerationClientBoundary({ children }: { children: ReactNode }) {
  if (!readAdminAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <QueryErrorResetBoundary>
      <CatchBoundary
        getResetKey={() => 'admin-generation'}
        errorComponent={AdminGenerationQueryError}
      >
        <AdminGenerationProvider>{children}</AdminGenerationProvider>
      </CatchBoundary>
    </QueryErrorResetBoundary>
  );
}

function AdminGenerationQueryError({ error, reset }: { error: unknown; reset: () => void }) {
  if (error instanceof ApiError && error.status === 401) {
    return <AdminAuthenticationExpired />;
  }
  return <AdminGenerationRetry reset={reset} />;
}

function AdminAuthenticationExpired() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    async function clearSessionAndNavigate() {
      clearAdminAccessToken();
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      void navigate({ to: '/login', replace: true });
    }

    void clearSessionAndNavigate();
  }, [navigate, queryClient]);

  return null;
}

function AdminGenerationRetry({ reset }: { reset: () => void }) {
  const query = useQueryErrorResetBoundary();

  return (
    <div role="alert">
      <p>관리자 기수 정보를 불러오지 못했습니다.</p>
      <ActionButton
        type="button"
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
