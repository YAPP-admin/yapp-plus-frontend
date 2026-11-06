/** WebView의 native 세션을 초기화하고 화면별 인증 결과를 공유하는 provider입니다. */

import type { AuthResult, AuthSession } from '@yapp-plus/app-bridge';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { getNativeSession, isNativeWebView } from './native-auth';
import { nativeSessionQueryKey, readAuthSession } from './operations';

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
}>;

const browserContext: NativeAuthSessionContextValue = {
  isNative: false,
  phase: 'BROWSER',
};

const NativeAuthSessionContext = createContext<NativeAuthSessionContextValue>(browserContext);

/** native 세션을 복구하는 query 계약입니다. */
export const nativeSessionQueryOptions = (isNative: boolean) =>
  queryOptions<AuthResult>({
    queryKey: nativeSessionQueryKey,
    queryFn: async ({ client, signal }) => {
      if (!isNative) {
        return { status: 'SIGNED_OUT' } satisfies AuthResult;
      }

      return readAuthSession(client, signal, getNativeSession);
    },
    staleTime: Number.POSITIVE_INFINITY,
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
    case 'SIGNED_OUT':
    case 'WITHDRAWN':
      return { phase: 'SIGNED_OUT' };
    case 'ERROR':
    case 'UNAVAILABLE':
      return { phase: 'UNAVAILABLE' };
    case 'AUTHENTICATING':
      return { phase: 'LOADING' };
    case 'CANCELLED':
    case 'SIGNUP_REQUIRED':
      return undefined;
  }

  return undefined;
};

/**
 * 앱 전체 Suspense 경계 안에서 native 세션 복구를 완료한 뒤 화면을 노출합니다.
 * 브리지 timeout은 인증 불가 상태로 변환해 오류를 화면 정책으로 전달합니다.
 */
export function NativeAuthSessionProvider({ children }: { children: ReactNode }) {
  const [isNative] = useState(() => isNativeWebView());
  const query = useSuspenseQuery(nativeSessionQueryOptions(isNative));
  const state = isNative
    ? (resultToState(query.data) ?? { phase: 'UNAVAILABLE' as const })
    : { phase: 'BROWSER' as const };

  return (
    <NativeAuthSessionContext value={{ isNative, phase: state.phase, session: state.session }}>
      {children}
    </NativeAuthSessionContext>
  );
}

/** 로그인·가입·계정 변경 화면이 native 세션 결과를 반영할 때 사용하는 상태입니다. */
export const useNativeAuthSession = (): NativeAuthSessionContextValue =>
  useContext(NativeAuthSessionContext);
