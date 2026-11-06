/** WebView의 native 세션을 초기화하고 화면별 인증 결과를 공유하는 provider입니다. */

import type { AuthResult, AuthSession } from '@yapp-plus/app-bridge';
import {
  focusManager,
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { getNativeSession, isNativeWebView } from './native-auth';
import { nativeSessionQueryKey, readAuthSession } from './operations';

import { accountScopeOptions, type AccountDestination } from './account';

export { nativeSessionQueryKey } from './operations';

export type NativeAuthSessionPhase =
  | 'BROWSER'
  | 'LOADING'
  | 'SIGNED_OUT'
  | 'SIGNED_IN'
  | 'UNAVAILABLE';

type NativeAuthSessionContextValue = Readonly<{
  isNative: boolean;
  phase: NativeAuthSessionPhase;
  session?: AuthSession;
  accountRevision: number;
  accountDestination: AccountDestination;
  unsupported: boolean;
  canRetry: boolean;
  isRecovering: boolean;
  retry: () => void;
}>;

const browserContext: NativeAuthSessionContextValue = {
  isNative: false,
  phase: 'BROWSER',
  accountRevision: 0,
  accountDestination: 'current',
  unsupported: false,
  canRetry: false,
  isRecovering: false,
  retry: () => {},
};

const NativeAuthSessionContext = createContext<NativeAuthSessionContextValue>(browserContext);

const recoveryInterval = 5000;

/** 로그인·가입 대기와 미지원에는 자동 조회를 시작하지 않습니다. */
const canRecover = (result: AuthResult | undefined): boolean =>
  (result?.status === 'UNAVAILABLE' || result?.status === 'ERROR') &&
  result.code !== 'UNSUPPORTED' &&
  result.retryable;

/** 자동·복귀·수동 재조회가 같은 cache와 진행 중 Promise를 사용합니다. */
export const nativeSessionQueryOptions = (isNative: boolean) =>
  queryOptions<AuthResult>({
    queryKey: nativeSessionQueryKey,
    queryFn: async ({ client, signal }) => {
      if (!isNative) {
        return { status: 'SIGNED_OUT' } satisfies AuthResult;
      }

      return readAuthSession(client, signal, getNativeSession);
    },
    retry: false,
    networkMode: 'always',
    staleTime: (query) =>
      canRecover(query.state.data) ? recoveryInterval : Number.POSITIVE_INFINITY,
    refetchInterval: (query) => (canRecover(query.state.data) ? recoveryInterval : false),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: () => focusManager.isFocused(),
  });

const resultToState = (
  result: AuthResult | undefined,
): Readonly<{ phase: NativeAuthSessionPhase; session?: AuthSession }> | undefined => {
  if (!result) {
    return undefined;
  }

  switch (result.status) {
    case 'SIGNED_IN':
      return { phase: 'SIGNED_IN', session: result.session };
    case 'SIGNUP_REQUIRED':
    case 'SIGNED_OUT':
    case 'WITHDRAWN':
      return { phase: 'SIGNED_OUT' };
    case 'ERROR':
    case 'UNAVAILABLE':
      return { phase: 'UNAVAILABLE' };
    case 'AUTHENTICATING':
      return { phase: 'LOADING' };
    case 'CANCELLED':
      return undefined;
  }

  return undefined;
};

/**
 * 앱 전체 Suspense 경계 안에서 native 세션 복구를 완료한 뒤 화면을 노출합니다.
 * 브리지 timeout은 인증 불가 상태로 변환해 오류를 화면 정책으로 전달합니다.
 */
export function NativeAuthSessionProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [isNative] = useState(() => isNativeWebView());
  const query = useSuspenseQuery(nativeSessionQueryOptions(isNative));
  const { data: scope } = useQuery(accountScopeOptions);
  const state = isNative
    ? (resultToState(query.data) ?? { phase: 'UNAVAILABLE' as const })
    : { phase: 'BROWSER' as const };

  return (
    <NativeAuthSessionContext
      value={{
        isNative,
        phase: state.phase,
        session: state.session,
        accountRevision: scope.revision,
        accountDestination: scope.destination,
        unsupported:
          (query.data.status === 'UNAVAILABLE' || query.data.status === 'ERROR') &&
          query.data.code === 'UNSUPPORTED',
        canRetry: isNative && canRecover(query.data),
        isRecovering: query.isFetching,
        // refetch()는 staleTime을 무시합니다. fetchQuery로 최소 간격과 진행 요청을 공유합니다.
        retry: () => {
          if (isNative && canRecover(query.data)) {
            void client.fetchQuery(nativeSessionQueryOptions(true)).catch(() => {
              // 인증 작업이 조회를 취소한 경우 해당 작업의 결과를 기다립니다.
            });
          }
        },
      }}
    >
      {children}
    </NativeAuthSessionContext>
  );
}

/** 로그인·가입·계정 변경 화면이 native 세션 결과를 반영할 때 사용하는 상태입니다. */
export const useNativeAuthSession = (): NativeAuthSessionContextValue =>
  useContext(NativeAuthSessionContext);
