import { QueryClient } from '@tanstack/react-query';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { expect, it } from 'vitest';
import {
  beginAuthOperation,
  finishAuthOperation,
  nativeSessionQueryKey,
  readAuthSession,
  markAuthRequired,
} from './operations';

const session: AuthResult = {
  status: 'SIGNED_IN',
  session: {
    userId: 7,
    sessionId: 'session',
    tokenVersion: 1,
    accessToken: 'test',
    expiresAt: 999999,
  },
};

it('낮은 tokenVersion의 조회 결과로 현재 세션을 덮지 않는다', async () => {
  const client = new QueryClient();
  const current: AuthResult = {
    status: 'SIGNED_IN',
    session: {
      userId: 7,
      sessionId: 'session',
      tokenVersion: 3,
      accessToken: 'test',
      expiresAt: 999999,
    },
  };
  client.setQueryData(nativeSessionQueryKey, current);

  const result = await readAuthSession(client, new AbortController().signal, () =>
    Promise.resolve({
      status: 'SIGNED_IN',
      session: { ...current.session, tokenVersion: 2 },
    }),
  );

  expect(result).toEqual(current);
});

it('최종 인증 실패는 현재 로그인 상태를 재인증 필요로 전환한다', () => {
  const client = new QueryClient();
  client.setQueryData(nativeSessionQueryKey, session);
  client.setQueryData(['schedule'], 'private');

  expect(markAuthRequired(client)).toBe(true);
  expect(client.getQueryData(['schedule'])).toBeUndefined();
  expect(client.getQueryData(nativeSessionQueryKey)).toEqual({
    status: 'ERROR',
    code: 'AUTH_REQUIRED',
    retryable: false,
  });
  expect(markAuthRequired(client)).toBe(false);
});

it('이전 작업을 해제해도 새 인증의 중복 요청 제한은 유지한다', () => {
  const client = new QueryClient();
  const old = beginAuthOperation(client, 'authenticate');
  beginAuthOperation(client, 'logout');
  const current = beginAuthOperation(client, 'authenticate');

  finishAuthOperation(client, old);
  expect(() => beginAuthOperation(client, 'authenticate')).toThrow('인증이 진행 중');

  finishAuthOperation(client, current);
  expect(() => beginAuthOperation(client, 'authenticate')).not.toThrow();
});
