import { QueryClient, MutationObserver, CancelledError } from '@tanstack/react-query';
import { expect, it } from 'vitest';
import type { AuthResult } from '@yapp-plus/app-bridge';
import {
  applyAuthResult,
  beginAuthOperation,
  finishAuthOperation,
  nativeSessionQueryKey,
  readAuthSession,
} from './operations';

const session = (
  userId: number,
  tokenVersion = 1,
): Extract<AuthResult, { status: 'SIGNED_IN' }> => ({
  status: 'SIGNED_IN',
  session: {
    userId,
    sessionId: `session-${userId}`,
    tokenVersion,
    accessToken: 'test',
    expiresAt: 999999,
  },
});
const signIn = (client: QueryClient, userId: number, tokenVersion = 1) => {
  const operation = beginAuthOperation(client, 'authenticate');
  const result = applyAuthResult(client, operation, 'authenticate', session(userId, tokenVersion));
  finishAuthOperation(client, operation);
  return result;
};

it('계정 변경은 이전 업무 query와 mutation 데이터를 제거하고 인증 결과를 유지한다', async () => {
  const client = new QueryClient();
  signIn(client, 1);
  client.setQueryData(['schedule'], { privateName: 'A' });
  await new MutationObserver(client, { mutationFn: () => Promise.resolve('A의 결과') }).mutate();

  signIn(client, 2);

  expect(client.getQueryData(['schedule'])).toBeUndefined();
  expect(client.getMutationCache().getAll()).toHaveLength(0);
  expect(client.getQueryData(nativeSessionQueryKey)).toEqual(session(2));
});

it('취소 신호를 무시한 이전 계정의 늦은 query는 새 cache에 들어오지 않는다', async () => {
  const client = new QueryClient();
  signIn(client, 1);
  let resolve!: (value: string) => void;
  const old = client
    .fetchQuery({
      queryKey: ['schedule'],
      queryFn: () =>
        new Promise<string>((done) => {
          resolve = done;
        }),
    })
    .catch(() => undefined);
  signIn(client, 2);
  client.setQueryData(['schedule'], 'B');
  resolve('A');
  await old;
  expect(client.getQueryData(['schedule'])).toBe('B');
});

it('같은 세션의 토큰 갱신과 조회 불가는 업무 cache를 지우지 않는다', () => {
  const client = new QueryClient();
  signIn(client, 1);
  client.setQueryData(['schedule'], 'A');
  signIn(client, 1, 2);
  applyAuthResult(client, beginAuthOperation(client, 'authenticate'), 'authenticate', {
    status: 'UNAVAILABLE',
    code: 'TIMEOUT',
    retryable: true,
  });
  expect(client.getQueryData(['schedule'])).toBe('A');
});

it('복구 조회로 계정이 바뀌어도 이전 업무 cache를 제거한다', async () => {
  const client = new QueryClient();
  signIn(client, 1);
  client.setQueryData(['schedule'], 'A');
  await readAuthSession(client, new AbortController().signal, () => Promise.resolve(session(2)));
  expect(client.getQueryData(['schedule'])).toBeUndefined();
});

it.each(['SIGNED_OUT', 'WITHDRAWN'] as const)(
  '%s 확정 시 정리하고 진행 중 인증은 완료할 수 있다',
  async (status) => {
    const client = new QueryClient();
    signIn(client, 1);
    client.setQueryData(['profile'], 'A');
    const observer = new MutationObserver(client, {
      mutationKey: ['native-auth', status],
      mutationFn: () => Promise.resolve({ status }),
      onSuccess: (result) => {
        applyAuthResult(client, beginAuthOperation(client, 'logout'), 'logout', result);
        expect(client.getMutationCache().getAll()).toHaveLength(1);
      },
    });
    await observer.mutate();
    expect(observer.getCurrentResult().isSuccess).toBe(true);
    expect(client.getQueryData(['profile'])).toBeUndefined();
    expect(client.getQueryData(nativeSessionQueryKey)).toEqual({ status });
  },
);

it('로그아웃 응답 유실에는 계정 식별을 유지하고 같은 계정 복구 시 cache를 보존한다', async () => {
  const client = new QueryClient();
  signIn(client, 1);
  client.setQueryData(['profile'], 'A');
  applyAuthResult(client, beginAuthOperation(client, 'logout'), 'logout', undefined);
  await readAuthSession(client, new AbortController().signal, () => Promise.resolve(session(1, 2)));
  expect(client.getQueryData(['profile'])).toBe('A');
});

it('같은 사용자라도 새로운 세션이면 정리하고 다른 QueryClient는 건드리지 않는다', () => {
  const client = new QueryClient();
  const other = new QueryClient();
  signIn(client, 1);
  signIn(other, 1);
  client.setQueryData(['profile'], 'A');
  other.setQueryData(['profile'], 'other');
  const next = session(1);
  applyAuthResult(client, beginAuthOperation(client, 'authenticate'), 'authenticate', {
    ...next,
    session: { ...next.session, sessionId: 'new-session' },
  });
  expect(client.getQueryData(['profile'])).toBeUndefined();
  expect(other.getQueryData(['profile'])).toBe('other');
});

it('이전 인증·복구의 늦은 결과는 새 계정 cache를 정리하지 않는다', async () => {
  const client = new QueryClient();
  signIn(client, 1);
  let resolve!: (value: AuthResult) => void;
  const restore = readAuthSession(
    client,
    new AbortController().signal,
    () =>
      new Promise<AuthResult>((done) => {
        resolve = done;
      }),
  );
  const old = beginAuthOperation(client, 'authenticate');
  applyAuthResult(client, beginAuthOperation(client, 'logout'), 'logout', { status: 'SIGNED_OUT' });
  signIn(client, 2);
  client.setQueryData(['profile'], 'B');
  applyAuthResult(client, old, 'authenticate', session(1));
  resolve(session(1));
  await expect(restore).rejects.toThrow(CancelledError);
  expect(client.getQueryData(['profile'])).toBe('B');
});

it('계정 경계가 HTTP query에 전달한 AbortSignal도 취소한다', async () => {
  const client = new QueryClient();
  signIn(client, 1);
  let requestSignal: AbortSignal | undefined;
  const request = client.fetchQuery({
    queryKey: ['schedule'],
    queryFn: ({ signal }) => {
      requestSignal = signal;
      return new Promise<never>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('요청 취소')), { once: true });
      });
    },
  });
  signIn(client, 2);
  await expect(request).rejects.toThrow(CancelledError);
  expect(requestSignal?.aborted).toBe(true);
});
