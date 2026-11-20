/** WebView 환경을 판별하고 native 인증 브리지의 여섯 메서드를 웹 흐름에 제공합니다. */

import {
  isYappPlusWebViewUserAgent,
  type AuthProvider,
  type AuthResult,
  type CompleteSignupInput,
  type RefreshSessionInput,
} from '@yapp-plus/app-bridge';
import { getAppBridge, type LinkedAppBridge } from '@yapp-plus/app-bridge/web';

const getBrowserUserAgent = (): string =>
  typeof navigator === 'undefined' ? '' : navigator.userAgent;

/** 사용자 에이전트의 앱 토큰으로 일반 브라우저와 WebView를 구분합니다. */
export const isNativeWebView = (userAgent = getBrowserUserAgent()): boolean =>
  isYappPlusWebViewUserAgent(userAgent);

const getNativeBridge = (): LinkedAppBridge | undefined =>
  isNativeWebView() ? getAppBridge() : undefined;

/** 개발 중 브릿지 연결 문제를 진단하되 인증 자격과 응답 본문은 기록하지 않습니다. */
const traceNativeBridge = (method: string, outcome: 'requested' | 'received' | 'failed'): void => {
  if (!import.meta.env.DEV) {
    return;
  }
  // oxlint-disable-next-line no-console -- 개발 WebView의 브릿지 단계만 기록하고 인증 값은 출력하지 않습니다.
  console.info(`[auth-bridge] ${method} ${outcome}`);
};

/** WebView에서만 native 로그인 RPC를 호출하고 일반 브라우저에서는 undefined를 반환합니다. */
export const signInWithNative = async (provider: AuthProvider): Promise<AuthResult | undefined> => {
  const bridge = getNativeBridge();
  if (!bridge) {
    return undefined;
  }
  traceNativeBridge('signIn', 'requested');
  try {
    const result = await bridge.signIn({ provider });
    traceNativeBridge('signIn', 'received');
    return result;
  } catch (error) {
    traceNativeBridge('signIn', 'failed');
    throw error;
  }
};

/** native가 보관한 가입 대기 자격으로 프로필 가입을 완료합니다. */
export const completeNativeSignup = async (
  input: CompleteSignupInput,
): Promise<AuthResult | undefined> => {
  const bridge = getNativeBridge();

  return bridge ? bridge.completeSignup(input) : undefined;
};

/** 앱 재실행 시 native 세션을 복구합니다. */
export const getNativeSession = async (): Promise<AuthResult | undefined> => {
  const bridge = getNativeBridge();

  if (!bridge) {
    return undefined;
  }
  // 메서드 목록은 hydration 후 도착합니다. onReady는 준비 완료 알림이 아닙니다.
  if (!bridge.isWebViewBridgeAvailable) {
    return { status: 'UNAVAILABLE', code: 'OUTCOME_UNKNOWN', retryable: true };
  }
  if (!bridge.isNativeMethodAvailable('getSession')) {
    return { status: 'UNAVAILABLE', code: 'UNSUPPORTED', retryable: false };
  }
  traceNativeBridge('getSession', 'requested');
  try {
    const result = await bridge.getSession();
    traceNativeBridge('getSession', 'received');
    return result;
  } catch (error) {
    traceNativeBridge('getSession', 'failed');
    throw error;
  }
};

/** native 세션 관리자에 요청 당시 세션 버전을 전달해 access token을 갱신합니다. */
export const refreshNativeSession = async (
  input: RefreshSessionInput,
): Promise<AuthResult | undefined> => {
  const bridge = getNativeBridge();

  return bridge ? bridge.refreshSession(input) : undefined;
};

/** native refresh token을 폐기하고 로컬 세션을 정리합니다. */
export const signOutNative = async (): Promise<AuthResult | undefined> => {
  const bridge = getNativeBridge();

  return bridge ? bridge.signOut() : undefined;
};

/** native access token으로 계정 탈퇴를 수행하고 세션을 정리합니다. */
export const withdrawNative = async (): Promise<AuthResult | undefined> => {
  const bridge = getNativeBridge();

  return bridge ? bridge.withdraw() : undefined;
};
