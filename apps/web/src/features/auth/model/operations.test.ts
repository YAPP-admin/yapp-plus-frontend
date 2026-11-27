import { QueryClient, isCancelledError } from '@tanstack/react-query';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { ApiError } from '@yapp-plus/api';
import { expect, it } from 'vitest';
import {
  beginAuthOperation,
  applyAuthResult,
  finishAuthOperation,
  nativeSessionQueryKey,
  readAuthSession,
  handleMutationAuthenticationError,
  markAuthRequired,
} from './operations';

const session: AuthResult = {
  status: 'SIGNED_IN',
  reviewTransition: 'NONE',
  session: {
    userId: 7,
    sessionId: 'session',
    tokenVersion: 1,
    accessToken: 'test',
    expiresAt: 999999,
  },
};

it.each(['PENDING', 'REJECTED', null] as const)(
  '제한 결과 %s 확정 뒤 늦은 정상 세션 조회는 폐기하고 업무 캐시를 비운다',
  async (reviewStatus) => {
    const client = new QueryClient();
    const initial = beginAuthOperation(client, 'authenticate');
    applyAuthResult(client, initial, 'authenticate', session);
    finishAuthOperation(client, initial);
    client.setQueryData(['schedule'], 'private');
    const operation = beginAuthOperation(client, 'authenticate');
    let resolve: ((result: AuthResult) => void) | undefined;
    const delayed = new Promise<AuthResult>((complete) => {
      resolve = complete;
    });
    const read = readAuthSession(client, new AbortController().signal, () => delayed);
    const review = { status: 'REVIEW_REQUIRED', userId: 7, reviewStatus } as const;
    expect(applyAuthResult(client, operation, 'authenticate', review)).toEqual(review);
    resolve?.(session);
    await expect(read).rejects.toSatisfy(isCancelledError);
    expect(client.getQueryData(nativeSessionQueryKey)).toEqual(review);
    expect(client.getQueryData(['schedule'])).toBeUndefined();
    client.clear();
  },
);

it('제한 계정의 저장 정리 실패는 제한 상태를 유지해 복귀 재시도를 허용한다', () => {
  const client = new QueryClient();
  const review = { status: 'REVIEW_REQUIRED', userId: 7, reviewStatus: 'REJECTED' } as const;
  const failure = { status: 'ERROR', code: 'STORAGE', retryable: true } as const;
  client.setQueryData(nativeSessionQueryKey, review);
  const operation = beginAuthOperation(client, 'logout');
  expect(applyAuthResult(client, operation, 'logout', failure)).toEqual(failure);
  expect(client.getQueryData(nativeSessionQueryKey)).toEqual(review);
});

it('낮은 tokenVersion의 조회 결과로 현재 세션을 덮지 않는다', async () => {
  const client = new QueryClient();
  const current: AuthResult = {
    status: 'SIGNED_IN',
    reviewTransition: 'NONE',
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
      reviewTransition: 'NONE',
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

it('업무 Mutation의 최종 401은 갱신 대기 없이 재인증 필요로 전환한다', () => {
  const client = new QueryClient();
  client.setQueryData(nativeSessionQueryKey, session);

  expect(handleMutationAuthenticationError(client, new ApiError(401, {}))).toBe(true);
  expect(client.getQueryData(nativeSessionQueryKey)).toEqual({
    status: 'ERROR',
    code: 'AUTH_REQUIRED',
    retryable: false,
  });
  expect(handleMutationAuthenticationError(client, new ApiError(403, {}))).toBe(false);
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
