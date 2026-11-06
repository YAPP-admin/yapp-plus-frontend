import { QueryClient } from '@tanstack/react-query';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { expect, it } from 'vitest';
import {
  beginAuthOperation,
  finishAuthOperation,
  nativeSessionQueryKey,
  readAuthSession,
} from './operations';

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
