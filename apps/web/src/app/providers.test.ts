/** 업무 Mutation의 인증 전파 기본 정책을 검증한다. */
import { MutationObserver } from '@tanstack/react-query';
import { ApiError } from '@yapp-plus/api';
import { afterEach, expect, it, vi } from 'vitest';
import { nativeSessionQueryKey } from '@/features/auth';
import { createAppQueryClient } from './providers';

const signedInSession = {
  status: 'SIGNED_IN' as const,
  session: {
    userId: 1,
    sessionId: 'session-1',
    tokenVersion: 1,
    accessToken: 'test',
    expiresAt: 999999,
  },
};

afterEach(() => vi.restoreAllMocks());

it('업무 Mutation의 401만 인증 상태를 갱신하고 상위 전파 대상으로 표시한다', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('YAPPPlusWebView');
  const client = createAppQueryClient();
  client.setQueryData(nativeSessionQueryKey, signedInSession);
  const error = new ApiError(401, {});
  const mutation = new MutationObserver(client, {
    mutationFn: () => Promise.reject(error),
  });

  await expect(mutation.mutate()).rejects.toBe(error);

  expect(client.getQueryData(nativeSessionQueryKey)).toEqual({
    status: 'ERROR',
    code: 'AUTH_REQUIRED',
    retryable: false,
  });
  const throwOnError = client.getDefaultOptions().mutations?.throwOnError;
  expect(typeof throwOnError === 'function' && throwOnError(error)).toBe(true);
  expect(typeof throwOnError === 'function' && throwOnError(new ApiError(403, {}))).toBe(false);
});
