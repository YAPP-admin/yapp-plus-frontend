/** 개발 빌드에서만 민감 정보 없이 native 인증 흐름의 단계 결과를 기록합니다. */

import type { AuthResult } from '@yapp-plus/app-bridge';

type NativeAuthStage = 'provider' | 'exchange' | 'storage';
type NativeAuthOutcome = 'started' | 'succeeded' | 'cancelled' | 'failed';
type NativeSessionStorageStage = 'legacy-delete' | 'session-read' | 'invalid-session-delete';

/** 토큰·nonce·사용자 정보·응답 본문을 받지 않아 로그 유출을 구조적으로 막습니다. */
export const traceNativeAuth = (
  stage: NativeAuthStage,
  outcome: NativeAuthOutcome,
  httpStatus?: number,
): void => {
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return;
  }
  const status = httpStatus === undefined ? '' : ` http=${httpStatus}`;
  // oxlint-disable-next-line no-console -- 개발 빌드의 원인 분류용이며 민감 값은 인자로 받지 않습니다.
  console.info(`[auth] ${stage} ${outcome}${status}`);
};

/** getSession RPC의 native 진입과 반환만 기록해 WebView 응답 전달 구간을 구분합니다. */
export const traceNativeSessionBridge = (
  outcome: 'entered' | 'returned' | 'failed',
  result?: AuthResult,
): void => {
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return;
  }
  const status = result ? ` status=${result.status}` : '';
  const code = result && 'code' in result ? ` code=${result.code}` : '';
  // oxlint-disable-next-line no-console -- 인증 값 대신 공개 결과 상태·코드만 기록합니다.
  console.info(`[auth-bridge] getSession native ${outcome}${status}${code}`);
};

/** 세션 값 없이 SecureStore의 실패 지점만 구분합니다. */
export const traceNativeSessionStorage = (
  stage: NativeSessionStorageStage,
  outcome: 'started' | 'succeeded' | 'failed',
  error?: unknown,
): void => {
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return;
  }
  const code = outcome === 'failed' ? getSafeStorageErrorCode(error) : undefined;
  const errorCode = code === undefined ? '' : ` code=${code}`;
  // oxlint-disable-next-line no-console -- 저장 키·값 없이 SecureStore 호출 결과만 기록합니다.
  console.info(`[auth-storage] ${stage} ${outcome}${errorCode}`);
};

/** 네이티브 오류에서 안전한 코드만 추출하고 원문 메시지는 기록하지 않습니다. */
const getSafeStorageErrorCode = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error;
    if (typeof code === 'number' && Number.isSafeInteger(code)) {
      return String(code);
    }
    if (typeof code === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(code)) {
      return code;
    }
  }
  if (error instanceof Error) {
    const match = /\b(?:OSStatus(?: error)?|code)\s*[=:]?\s*(-?\d+)\b/i.exec(error.message);
    return match?.[1];
  }
  return undefined;
};
