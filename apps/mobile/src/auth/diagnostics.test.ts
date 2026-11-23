/** 개발용 인증 진단이 세션 값 대신 단계·결과만 기록하는지 검증합니다. */

import { afterEach, expect, it, vi } from 'vitest';

import { traceNativeSessionBridge, traceNativeSessionStorage } from './diagnostics';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('getSession native 반환 로그에 토큰과 사용자 ID를 포함하지 않는다', () => {
  vi.stubGlobal('__DEV__', true);
  const info = vi.spyOn(console, 'info').mockImplementation(() => {});

  traceNativeSessionBridge('returned', {
    status: 'SIGNED_IN',
    session: {
      accessToken: 'secret-access-token',
      expiresAt: 9999999999,
      name: '테스트 사용자',
      sessionId: 'session-id',
      tokenVersion: 1,
      userId: 7,
    },
  });

  expect(info).toHaveBeenCalledWith('[auth-bridge] getSession native returned status=SIGNED_IN');
});

it('getSession native 오류 결과는 공개 오류 코드만 기록한다', () => {
  vi.stubGlobal('__DEV__', true);
  const info = vi.spyOn(console, 'info').mockImplementation(() => {});

  traceNativeSessionBridge('returned', {
    status: 'UNAVAILABLE',
    code: 'NETWORK',
    retryable: true,
  });

  expect(info).toHaveBeenCalledWith(
    '[auth-bridge] getSession native returned status=UNAVAILABLE code=NETWORK',
  );
});

it('SecureStore 진단은 키나 저장 값 대신 허용된 네이티브 코드만 기록한다', () => {
  vi.stubGlobal('__DEV__', true);
  const info = vi.spyOn(console, 'info').mockImplementation(() => {});

  traceNativeSessionStorage(
    'session-read',
    'failed',
    new Error('Error Domain=NSOSStatusErrorDomain Code=-34018 "sensitive-value"'),
  );

  expect(info).toHaveBeenCalledWith('[auth-storage] session-read failed code=-34018');
});
