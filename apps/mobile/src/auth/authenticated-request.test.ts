/** 같은 계정으로 재로그인해도 이전 요청을 새 로그인 자격으로 재시도하지 않는지 검증합니다. */
import { expect, it, vi } from 'vitest';
import { requestWithSessionRefresh, type AuthRequestRuntime } from './authenticated-request';

it('같은 계정의 새 로그인 세션에서는 이전 401 요청을 폐기한다', async () => {
  const original = { userId: 1, sessionId: 'login-1', tokenVersion: 1, accessToken: 'access-1' };
  let current = original;
  const pending = Promise.withResolvers<{ response: Response }>();
  const request = vi
    .fn<(accessToken: string) => Promise<{ response: Response }>>()
    .mockReturnValueOnce(pending.promise);
  const refreshSession = vi.fn<AuthRequestRuntime['refreshSession']>();
  const operation = requestWithSessionRefresh(original, request, {
    getSessionSnapshot: () => current,
    refreshSession,
  });

  current = { ...original, sessionId: 'login-2', accessToken: 'access-2' };
  pending.resolve({ response: new Response(null, { status: 401 }) });

  await expect(operation).resolves.toEqual({ ok: false, code: 'CANCELLED' });
  expect(request).toHaveBeenCalledOnce();
  expect(refreshSession).not.toHaveBeenCalled();
});
