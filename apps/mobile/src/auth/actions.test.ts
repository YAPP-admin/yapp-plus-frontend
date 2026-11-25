/** AuthActions가 공급자 인증·가입·세션 경계를 올바른 브리지 결과로 변환하는지 검증합니다. */

import type { AuthenticationResponse } from '@yapp-plus/api/generated';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthActions, type NativeAuthRuntime } from './actions';
import { nativeAuthApi } from './auth-api';
import type { NativeIdentity } from './providers';
import { SessionManager } from './session';
import { NativeAuthenticationCancelledError } from './errors';

import type { StoredSession } from './storage';

vi.mock('expo-crypto', async () => {
  const { randomUUID } = await import('node:crypto');
  return { randomUUID };
});

const storage = vi.hoisted(() => ({
  clearSession: vi.fn<() => Promise<void>>(),
  getSession: vi.fn<() => Promise<StoredSession | null>>(),
  setSession: vi.fn<(session: StoredSession) => Promise<void>>(),
}));

vi.mock('./storage', () => ({ authStorage: storage }));

const signedInResponse = (version: number): AuthenticationResponse => ({
  result: 'SIGNED_IN',
  user: {
    id: 7,
    name: '  테스트 사용자  ',
    phoneNumber: '+821012345678',
    reviewStatus: 'APPROVED',
  },
  session: {
    accessToken: `access-${version}`,
    refreshToken: `refresh-${version}`,
    expiresIn: 3_600,
  },
  registrationToken: null,
  expiresIn: null,
});

const signupRequiredResponse: AuthenticationResponse = {
  result: 'SIGNUP_REQUIRED',
  user: null,
  session: null,
  registrationToken: 'registration-token',
  expiresIn: 600,
};

const createRuntime = (): NativeAuthRuntime => ({
  session: new SessionManager(),
  authenticateWithProvider: vi.fn<NativeAuthRuntime['authenticateWithProvider']>(),
  authenticateApple: vi.fn<NativeAuthRuntime['authenticateApple']>(),
  authenticateGoogle: vi.fn<NativeAuthRuntime['authenticateGoogle']>(),
  register: vi.fn<NativeAuthRuntime['register']>(),
  renew: vi.fn<NativeAuthRuntime['renew']>(),
  revoke: vi.fn<NativeAuthRuntime['revoke']>().mockResolvedValue({ ok: true }),
  withdraw: vi.fn<NativeAuthRuntime['withdraw']>(),
});

const googleIdentity: NativeIdentity = {
  provider: 'google',
  idToken: 'google-id-token',
  nonce: 'raw-nonce',
};

const signupInput = { name: '테스트 사용자', phoneNumber: '010-1234-5678' };

const googleActions = () => {
  const runtime = createRuntime();
  vi.mocked(runtime.authenticateWithProvider).mockResolvedValue(googleIdentity);
  vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signedInResponse(1) });
  return { runtime, actions: new AuthActions(runtime) };
};

const reviewedResponse = (
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null,
  userId = 7,
): AuthenticationResponse => {
  const response = signedInResponse(1);
  if (!response.user) {
    throw new Error('사용자 fixture 누락');
  }
  return { ...response, user: { ...response.user, id: userId, reviewStatus } };
};

const pendingLoginActions = async () => {
  const context = googleActions();
  vi.mocked(context.runtime.authenticateGoogle).mockResolvedValueOnce({
    data: reviewedResponse('PENDING'),
  });
  await context.actions.signIn({ provider: 'google' });
  await context.actions.signOut();
  return context;
};

const renewalActions = async () => {
  const { runtime, actions } = googleActions();
  const result = await actions.signIn({ provider: 'google' });
  if (result.status !== 'SIGNED_IN') {
    throw new Error('테스트 로그인 실패');
  }
  const http = vi.fn<typeof fetch>();
  vi.mocked(runtime.renew).mockImplementation((input) =>
    nativeAuthApi.renew({
      ...input,
      baseUrl: 'https://api.test',
      kyOptions: { fetch: http },
    }),
  );
  return { runtime, actions, http, session: result.session };
};

describe('AuthActions', () => {
  it('Apple의 대기 응답도 토큰 없이 제한 상태로 유지한다', async () => {
    const runtime = createRuntime();
    vi.mocked(runtime.authenticateWithProvider).mockResolvedValue({
      provider: 'apple',
      identityToken: 'test',
      authorizationCode: 'code',
      nonce: 'nonce',
    });
    vi.mocked(runtime.authenticateApple).mockResolvedValue({ data: reviewedResponse('PENDING') });
    const actions = new AuthActions(runtime);
    await expect(actions.signIn({ provider: 'apple' })).resolves.toEqual({
      status: 'REVIEW_REQUIRED',
      userId: 7,
      reviewStatus: 'PENDING',
    });
    expect(runtime.authenticateGoogle).not.toHaveBeenCalled();
    expect(storage.setSession).not.toHaveBeenCalled();
    expect(runtime.session.snapshot).toBeUndefined();
  });

  it('정상 세션 뒤 제한 응답을 받으면 이전 자격을 제거하고 제한 토큰은 저장하지 않는다', async () => {
    const { runtime, actions } = googleActions();
    await actions.signIn({ provider: 'google' });
    storage.setSession.mockClear();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({
      data: reviewedResponse('PENDING'),
    });
    await actions.signIn({ provider: 'google' });
    expect(storage.clearSession).toHaveBeenCalled();
    expect(storage.setSession).not.toHaveBeenCalled();
    expect(runtime.session.snapshot).toBeUndefined();
    await expect(actions.getSession()).resolves.toMatchObject({ status: 'REVIEW_REQUIRED' });
  });

  it('다른 승인 계정으로 로그인하면 이전 대기 이력을 소비한다', async () => {
    const { runtime, actions } = await pendingLoginActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({
      data: reviewedResponse('APPROVED', 8),
    });
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'NONE',
      session: { userId: 8 },
    });
    await actions.signOut();
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'NONE',
      session: { userId: 7 },
    });
  });

  it('다른 대기 계정으로 바뀌면 새 계정의 승인에만 전환을 전달한다', async () => {
    const { runtime, actions } = await pendingLoginActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({
      data: reviewedResponse('PENDING', 8),
    });
    await actions.signIn({ provider: 'google' });
    await actions.signOut();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({
      data: reviewedResponse('APPROVED', 8),
    });
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'PENDING_TO_APPROVED',
      session: { userId: 8 },
    });
  });

  it.each(['REJECTED', null] as const)('%s 결과는 이전 대기 이력을 지운다', async (status) => {
    const { runtime, actions } = await pendingLoginActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({
      data: reviewedResponse(status, 8),
    });
    await actions.signIn({ provider: 'google' });
    await actions.signOut();
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'NONE',
    });
  });

  it('신규 가입 필요 결과는 이전 대기 이력을 지운다', async () => {
    const { runtime, actions } = await pendingLoginActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({ data: signupRequiredResponse });
    vi.mocked(runtime.register).mockResolvedValueOnce({ data: signedInResponse(1) });
    await actions.signIn({ provider: 'google' });
    await expect(actions.completeSignup(signupInput)).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'NONE',
    });
  });

  it.each(['cancel', 'network', 'storage'] as const)(
    '%s 실패 후 같은 계정으로 재시도하면 대기 이력을 보존한다',
    async (failure) => {
      const { runtime, actions } = await pendingLoginActions();
      if (failure === 'cancel') {
        vi.mocked(runtime.authenticateWithProvider).mockRejectedValueOnce(
          new NativeAuthenticationCancelledError(),
        );
      } else if (failure === 'network') {
        vi.mocked(runtime.authenticateGoogle).mockRejectedValueOnce(new Error('network'));
      } else {
        storage.setSession.mockRejectedValueOnce(new Error('storage'));
      }
      const failed = await actions.signIn({ provider: 'google' });
      expect(failed.status).toBe(
        { cancel: 'CANCELLED', network: 'UNAVAILABLE', storage: 'ERROR' }[failure],
      );
      expect(runtime.session.snapshot).toBeUndefined();
      await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
        status: 'SIGNED_IN',
        reviewTransition: 'PENDING_TO_APPROVED',
      });
      await actions.signOut();
      await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
        status: 'SIGNED_IN',
        reviewTransition: 'NONE',
      });
    },
  );

  it('대기 상태의 로그아웃 정리 실패는 상태와 이력을 유지해 재시도할 수 있다', async () => {
    const { runtime, actions } = googleActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({
      data: reviewedResponse('PENDING'),
    });
    await actions.signIn({ provider: 'google' });
    storage.clearSession.mockRejectedValueOnce(new Error('storage'));
    await expect(actions.signOut()).resolves.toMatchObject({ status: 'ERROR', code: 'STORAGE' });
    await expect(actions.getSession()).resolves.toEqual({
      status: 'REVIEW_REQUIRED',
      userId: 7,
      reviewStatus: 'PENDING',
    });
    await expect(actions.signOut()).resolves.toEqual({ status: 'SIGNED_OUT' });
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'PENDING_TO_APPROVED',
    });
  });

  it.each(['PENDING', 'REJECTED', null] as const)(
    '가입 완료가 %s 상태면 토큰을 저장하지 않는다',
    async (reviewStatus) => {
      const { runtime, actions } = googleActions();
      vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({ data: signupRequiredResponse });
      const response = signedInResponse(1);
      if (!response.user) {
        throw new Error('사용자 fixture 누락');
      }
      response.user.reviewStatus = reviewStatus;
      vi.mocked(runtime.register).mockResolvedValue({ data: response });
      await actions.signIn({ provider: 'google' });
      await expect(actions.completeSignup(signupInput)).resolves.toEqual({
        status: 'REVIEW_REQUIRED',
        userId: 7,
        reviewStatus,
      });
      expect(storage.setSession).not.toHaveBeenCalled();
    },
  );

  it('필드가 누락된 로그인 응답은 승인으로 취급하지 않는다', async () => {
    const { runtime, actions } = googleActions();
    const response = signedInResponse(1);
    if (!response.user) {
      throw new Error('사용자 fixture 누락');
    }
    Reflect.deleteProperty(response.user, 'reviewStatus');
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({ data: response });
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'ERROR',
      code: 'INVALID_RESPONSE',
    });
    expect(storage.setSession).not.toHaveBeenCalled();
  });

  it('새 runtime은 이전 실행의 대기 이력을 복구하지 않는다', async () => {
    const { runtime, actions } = googleActions();
    const response = signedInResponse(1);
    if (!response.user) {
      throw new Error('사용자 fixture 누락');
    }
    response.user.reviewStatus = 'PENDING';
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({ data: response });
    await actions.signIn({ provider: 'google' });
    const restarted = googleActions();
    await expect(restarted.actions.getSession()).resolves.toEqual({ status: 'SIGNED_OUT' });
    await expect(restarted.actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'NONE',
    });
  });
  it.each(['PENDING', 'REJECTED', null] as const)(
    '%s 계정은 저장 없이 제한 결과만 반환한다',
    async (reviewStatus) => {
      const { runtime, actions } = googleActions();
      const response = signedInResponse(1);
      if (!response.user) {
        throw new Error('사용자 fixture 누락');
      }
      response.user.reviewStatus = reviewStatus;
      vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: response });
      const expected = { status: 'REVIEW_REQUIRED', userId: 7, reviewStatus };
      await expect(actions.signIn({ provider: 'google' })).resolves.toEqual(expected);
      expect(storage.setSession).not.toHaveBeenCalled();
      expect(runtime.session.snapshot).toBeUndefined();
      await expect(actions.getSession()).resolves.toEqual(expected);
      await expect(actions.refreshSession({ sessionId: 'old', tokenVersion: 1 })).resolves.toEqual(
        expected,
      );
      await expect(actions.signOut()).resolves.toEqual({ status: 'SIGNED_OUT' });
      await expect(actions.getSession()).resolves.toEqual({ status: 'SIGNED_OUT' });
    },
  );

  it('대기 뒤 로그인 복귀 후 같은 계정이 승인되면 전환을 한 번 전달한다', async () => {
    const { runtime, actions } = googleActions();
    const response = signedInResponse(1);
    if (!response.user) {
      throw new Error('사용자 fixture 누락');
    }
    response.user.reviewStatus = 'PENDING';
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({ data: response });
    await actions.signIn({ provider: 'google' });
    await actions.signOut();
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'PENDING_TO_APPROVED',
    });
    await expect(actions.getSession()).resolves.toMatchObject({
      status: 'SIGNED_IN',
      reviewTransition: 'NONE',
    });
  });

  it('제한 상태 정리에 실패하면 저장 오류를 반환하고 정상 세션을 만들지 않는다', async () => {
    const { runtime, actions } = googleActions();
    const response = signedInResponse(1);
    if (!response.user) {
      throw new Error('사용자 fixture 누락');
    }
    response.user.reviewStatus = 'PENDING';
    storage.clearSession.mockRejectedValueOnce(new Error('storage'));
    vi.mocked(runtime.authenticateGoogle).mockResolvedValueOnce({ data: response });
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'ERROR',
      code: 'STORAGE',
    });
    expect(storage.setSession).not.toHaveBeenCalled();
  });
  beforeEach(() => {
    storage.clearSession.mockReset().mockResolvedValue(undefined);
    storage.getSession.mockReset().mockResolvedValue(null);
    storage.setSession.mockReset().mockResolvedValue(undefined);
  });

  it('공급자 credential을 생성 API에 전달하고 세션을 시작한다', async () => {
    const runtime = createRuntime();
    vi.mocked(runtime.authenticateWithProvider).mockResolvedValue(googleIdentity);
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signedInResponse(1) });
    const actions = new AuthActions(runtime);

    const result = await actions.signIn({ provider: 'google' });

    expect(result).toMatchObject({
      status: 'SIGNED_IN',
      session: { accessToken: 'access-1', name: '테스트 사용자' },
    });
    expect(runtime.authenticateGoogle).toHaveBeenCalledWith({
      body: { idToken: 'google-id-token', nonce: 'raw-nonce' },
    });
    expect(storage.setSession).toHaveBeenCalledWith({
      refreshToken: 'refresh-1',
      userId: 7,
      name: '테스트 사용자',
    });
  });

  it('가입 필요 응답을 보관하고 전화번호를 서버 전송 직전에 E.164로 변환한다', async () => {
    const runtime = createRuntime();
    vi.mocked(runtime.authenticateWithProvider).mockResolvedValue(googleIdentity);
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signupRequiredResponse });
    vi.mocked(runtime.register).mockResolvedValue({ data: signedInResponse(1) });
    const actions = new AuthActions(runtime);

    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNUP_REQUIRED',
    });
    await expect(
      actions.completeSignup({ name: '테스트 사용자', phoneNumber: '010-1234-5678' }),
    ).resolves.toMatchObject({ status: 'SIGNED_IN', session: { name: '테스트 사용자' } });

    expect(runtime.register).toHaveBeenCalledWith({
      body: {
        registrationToken: 'registration-token',
        name: '테스트 사용자',
        phoneNumber: '+821012345678',
      },
    });
  });

  it('로그아웃 서버 실패에도 로컬 세션을 삭제한다', async () => {
    const runtime = createRuntime();
    await runtime.session.establish(
      {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        expiresAt: Date.now() + 3_600_000,
        userId: 7,
      },
      runtime.session.captureGeneration(),
    );
    vi.mocked(runtime.revoke).mockRejectedValue(new Error('network'));
    const actions = new AuthActions(runtime);

    await expect(actions.signOut()).resolves.toEqual({ status: 'SIGNED_OUT' });
    expect(storage.clearSession).toHaveBeenCalledOnce();
    expect(runtime.session.refreshToken).toBeUndefined();
  });

  it('메모리 복원 전 로그아웃도 저장된 토큰의 서버 해제를 먼저 확인한다', async () => {
    const { runtime, actions } = googleActions();
    storage.getSession.mockResolvedValue({ userId: 7, refreshToken: 'stored-refresh' });
    await expect(actions.signOut()).resolves.toEqual({ status: 'SIGNED_OUT' });
    expect(runtime.revoke).toHaveBeenCalledExactlyOnceWith({
      body: { refreshToken: 'stored-refresh' },
    });
    expect(runtime.renew).not.toHaveBeenCalled();
    expect(storage.clearSession).toHaveBeenCalledOnce();
  });

  it.each([
    [{ kind: 'failure', code: 'AUTH_REQUIRED' }, 'AUTH_REQUIRED', false],
    [{ kind: 'failure', code: 'SERVER' }, 'SERVER', true],
    [{ kind: 'failure', code: 'TIMEOUT' }, 'TIMEOUT', true],
    [{ kind: 'failure', code: 'OUTCOME_UNKNOWN' }, 'OUTCOME_UNKNOWN', false],
  ] as const)('탈퇴 %o 결과는 로컬 세션을 삭제하지 않는다', async (withdrawal, code, retryable) => {
    const { runtime, actions } = googleActions();
    await actions.signIn({ provider: 'google' });
    vi.mocked(runtime.withdraw).mockResolvedValue(withdrawal);

    await expect(actions.withdraw()).resolves.toEqual({
      status: 'ERROR',
      code,
      retryable,
    });
    expect(storage.clearSession).not.toHaveBeenCalled();
  });

  it('탈퇴 204 성공 뒤에만 로컬 세션을 삭제한다', async () => {
    const { runtime, actions } = googleActions();
    await actions.signIn({ provider: 'google' });
    vi.mocked(runtime.withdraw).mockResolvedValue({ kind: 'success' });

    await expect(actions.withdraw()).resolves.toEqual({ status: 'WITHDRAWN' });
    expect(storage.clearSession).toHaveBeenCalledOnce();
  });

  it.each([
    [204, { kind: 'success' }],
    [401, { kind: 'failure', code: 'AUTH_REQUIRED' }],
    [503, { kind: 'failure', code: 'SERVER' }],
  ] as const)('탈퇴 HTTP %s를 adapter 경계에서 구분한다', async (status, expected) => {
    const http = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status }));

    await expect(
      nativeAuthApi.withdraw({
        headers: { Authorization: 'Bearer fixture' },
        baseUrl: 'https://api.test',
        kyOptions: { fetch: http },
      }),
    ).resolves.toEqual(expected);
    expect(http).toHaveBeenCalledOnce();
  });

  it('탈퇴 timeout과 응답 유실을 자동 재시도하지 않고 구분한다', async () => {
    const timeout = Object.assign(new Error('timeout'), { name: 'TimeoutError' });
    const timeoutHttp = vi.fn<typeof fetch>().mockRejectedValue(timeout);
    const missingHttp = vi.fn<typeof fetch>().mockRejectedValue(new Error('network'));

    await expect(
      nativeAuthApi.withdraw({
        headers: { Authorization: 'Bearer fixture' },
        baseUrl: 'https://api.test',
        kyOptions: { fetch: timeoutHttp },
      }),
    ).resolves.toEqual({ kind: 'failure', code: 'TIMEOUT' });
    await expect(
      nativeAuthApi.withdraw({
        headers: { Authorization: 'Bearer fixture' },
        baseUrl: 'https://api.test',
        kyOptions: { fetch: missingHttp },
      }),
    ).resolves.toEqual({ kind: 'failure', code: 'NETWORK' });
    expect(timeoutHttp).toHaveBeenCalledOnce();
    expect(missingHttp).toHaveBeenCalledOnce();
  });

  it('탈퇴 응답이 늦는 동안 새로 확정된 세션을 삭제하지 않는다', async () => {
    const { runtime, actions } = googleActions();
    await actions.signIn({ provider: 'google' });
    const withdrawal = Promise.withResolvers<Awaited<ReturnType<NativeAuthRuntime['withdraw']>>>();
    vi.mocked(runtime.withdraw).mockReturnValue(withdrawal.promise);
    const pending = actions.withdraw();
    await vi.waitFor(() => expect(runtime.withdraw).toHaveBeenCalledOnce());
    await runtime.session.establish(
      {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        expiresAt: Date.now() + 3_600_000,
        userId: 8,
      },
      runtime.session.captureGeneration(),
    );
    withdrawal.resolve({ kind: 'success' });

    await expect(pending).resolves.toEqual({ status: 'CANCELLED' });
    expect(runtime.session.refreshToken).toBe('new-refresh');
    expect(storage.clearSession).not.toHaveBeenCalled();
  });

  it.each(['login', 'signup'])('%s 요청 시작 세대를 세션 확정까지 전달한다', async (kind) => {
    const runtime = createRuntime();
    const actions = new AuthActions(runtime);
    const response = Promise.withResolvers<{ data: AuthenticationResponse }>();
    vi.mocked(runtime.authenticateWithProvider).mockResolvedValue(googleIdentity);
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signupRequiredResponse });
    if (kind === 'signup') {
      await actions.signIn({ provider: 'google' });
    }
    const started = Promise.withResolvers<void>();
    const api = kind === 'signup' ? runtime.register : runtime.authenticateGoogle;
    vi.mocked(api).mockImplementation(() => {
      started.resolve();
      return response.promise;
    });
    const request =
      kind === 'signup'
        ? actions.completeSignup({ name: '테스트 사용자', phoneNumber: '010-1234-5678' })
        : actions.signIn({ provider: 'google' });
    await started.promise;
    await actions.signOut();
    response.resolve({ data: signedInResponse(1) });
    await expect(request).resolves.toEqual({ status: 'CANCELLED' });
    expect(storage.setSession).not.toHaveBeenCalled();
  });

  it.each([204, 400, 401, 503])('revoke HTTP %s 응답에도 로컬 세션을 삭제한다', async (status) => {
    const { runtime, actions } = googleActions();
    await actions.signIn({ provider: 'google' });
    const http = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status }));
    vi.mocked(runtime.revoke).mockImplementation((input) =>
      nativeAuthApi.revoke({ ...input, baseUrl: 'https://api.test', kyOptions: { fetch: http } }),
    );
    await expect(actions.signOut()).resolves.toMatchObject({
      status: 'SIGNED_OUT',
    });
    expect(storage.clearSession).toHaveBeenCalledTimes(1);
    expect(http).toHaveBeenCalledTimes(1);
  });

  it('이미 시작한 등록의 401 갱신·재시도를 기다린 뒤 최신 토큰으로 한 번만 revoke한다', async () => {
    const { runtime, actions } = googleActions();
    const signedIn = await actions.signIn({ provider: 'google' });
    if (signedIn.status !== 'SIGNED_IN') {
      throw new Error('로그인 fixture 실패');
    }
    const response = Promise.withResolvers<void>();
    const finishRegistration = Promise.withResolvers<void>();
    vi.mocked(runtime.renew).mockResolvedValue({
      kind: 'success',
      tokens: {
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
        expiresAt: Date.now() + 3_600_000,
      },
    });
    const request = actions.runSessionRequest(async (refresh) => {
      await response.promise;
      const refreshed = await refresh(signedIn.session);
      await finishRegistration.promise;
      return refreshed;
    });
    const logout = actions.signOut();
    const duplicate = actions.signOut();
    const newRequest = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    await expect(actions.runSessionRequest(newRequest)).resolves.toBeUndefined();
    expect(newRequest).not.toHaveBeenCalled();
    response.resolve();
    await vi.waitFor(() => expect(runtime.session.refreshToken).toBe('refresh-2'));
    expect(runtime.revoke).not.toHaveBeenCalled();
    finishRegistration.resolve();
    await expect(request).resolves.toMatchObject({ status: 'SIGNED_IN' });
    await expect(logout).resolves.toEqual({ status: 'SIGNED_OUT' });
    await expect(duplicate).resolves.toEqual({ status: 'SIGNED_OUT' });
    expect(runtime.revoke).toHaveBeenCalledExactlyOnceWith({ body: { refreshToken: 'refresh-2' } });
  });

  it.each(['success', 'invalid-session'] as const)(
    '진행 중인 일반 갱신의 %s 결과를 확인한 뒤 로그아웃한다',
    async (kind) => {
      const { runtime, actions } = googleActions();
      const signedIn = await actions.signIn({ provider: 'google' });
      if (signedIn.status !== 'SIGNED_IN') {
        throw new Error('로그인 fixture 실패');
      }
      const renewed = Promise.withResolvers<Awaited<ReturnType<NativeAuthRuntime['renew']>>>();
      vi.mocked(runtime.renew).mockReturnValue(renewed.promise);
      const refresh = actions.refreshSession(signedIn.session);
      const logout = actions.signOut();
      expect(runtime.revoke).not.toHaveBeenCalled();
      renewed.resolve(
        kind === 'invalid-session'
          ? { kind }
          : {
              kind: 'success',
              tokens: {
                accessToken: 'access-2',
                refreshToken: 'refresh-2',
                expiresAt: Date.now() + 3_600_000,
              },
            },
      );
      await refresh;
      await expect(logout).resolves.toEqual({ status: 'SIGNED_OUT' });
      expect(vi.mocked(runtime.revoke).mock.calls).toEqual(
        kind === 'success' ? [[{ body: { refreshToken: 'refresh-2' } }]] : [],
      );
    },
  );

  it.each(['resolve', 'reject'])(
    'revoke %s 대기 중 로그인과 갱신을 보류하고 완료 뒤 로컬 세션을 삭제한다',
    async (end) => {
      const { runtime, actions } = googleActions();
      await actions.signIn({ provider: 'google' });
      const revoke = Promise.withResolvers<Awaited<ReturnType<NativeAuthRuntime['revoke']>>>();
      vi.mocked(runtime.revoke).mockReturnValue(revoke.promise);
      const logout = actions.signOut();
      await vi.waitFor(() => expect(runtime.revoke).toHaveBeenCalledOnce());
      expect(runtime.session.accessToken).toBe('access-1');
      expect(storage.clearSession).not.toHaveBeenCalled();
      await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
        status: 'ERROR',
        code: 'BUSY',
      });
      await expect(
        actions.refreshSession({ sessionId: 'session', tokenVersion: 1 }),
      ).resolves.toMatchObject({ code: 'BUSY' });
      expect(runtime.renew).not.toHaveBeenCalled();
      if (end === 'resolve') {
        revoke.resolve({ ok: true });
      } else {
        revoke.reject(new Error('network'));
      }
      await expect(logout).resolves.toEqual({ status: 'SIGNED_OUT' });
      expect(runtime.revoke).toHaveBeenCalledWith({ body: { refreshToken: 'refresh-1' } });
      expect(runtime.session.refreshToken).toBeUndefined();
      expect(storage.clearSession).toHaveBeenCalledOnce();
    },
  );

  it.each(['resolve', 'reject'])('로그아웃 뒤 provider %s 결과를 무시한다', async (end) => {
    const { runtime, actions } = googleActions();
    const provider = Promise.withResolvers<NativeIdentity>();
    vi.mocked(runtime.authenticateWithProvider).mockReturnValue(provider.promise);
    const login = actions.signIn({ provider: 'google' });
    await actions.signOut();
    if (end === 'resolve') {
      provider.resolve(googleIdentity);
    } else {
      provider.reject(new Error('provider'));
    }
    await expect(login).resolves.toEqual({ status: 'CANCELLED' });
    expect(runtime.authenticateGoogle).not.toHaveBeenCalled();
  });

  it.each(['signup-required', 'api-error', 'throw'])(
    '늦은 인증 %s가 로그아웃을 덮지 않는다',
    async (end) => {
      const { runtime, actions } = googleActions();
      const response =
        Promise.withResolvers<Awaited<ReturnType<NativeAuthRuntime['authenticateGoogle']>>>();
      const started = Promise.withResolvers<void>();
      vi.mocked(runtime.authenticateGoogle).mockImplementation(() => {
        started.resolve();
        return response.promise;
      });
      const login = actions.signIn({ provider: 'google' });
      await started.promise;
      await actions.signOut();
      if (end === 'throw') {
        response.reject(new Error('network'));
      } else {
        response.resolve(
          end === 'signup-required' ? { data: signupRequiredResponse } : { error: {} },
        );
      }
      await expect(login).resolves.toEqual({ status: 'CANCELLED' });
      await expect(actions.completeSignup(signupInput)).resolves.toMatchObject({
        code: 'SIGNUP_EXPIRED',
      });
      expect(runtime.register).not.toHaveBeenCalled();
    },
  );

  it.each(['logout', 'new-login'])('%s에서 이전 가입 대기 자격을 정리한다', async (next) => {
    const { runtime, actions } = googleActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signupRequiredResponse });
    await actions.signIn({ provider: 'google' });
    if (next === 'logout') {
      await actions.signOut();
    } else {
      vi.mocked(runtime.authenticateWithProvider).mockRejectedValue(new Error('provider'));
      await actions.signIn({ provider: 'google' });
    }
    await expect(actions.completeSignup(signupInput)).resolves.toMatchObject({
      code: 'SIGNUP_EXPIRED',
    });
    expect(runtime.register).not.toHaveBeenCalled();
  });

  it.each(['resolve', 'reject'])('이전 가입 %s가 새 가입 자격을 지우지 않는다', async (end) => {
    const { runtime, actions } = googleActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signupRequiredResponse });
    await actions.signIn({ provider: 'google' });
    const response = Promise.withResolvers<{ data: AuthenticationResponse }>();
    vi.mocked(runtime.register).mockReturnValueOnce(response.promise);
    const signup = actions.completeSignup(signupInput);
    await actions.signOut();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({
      data: { ...signupRequiredResponse, registrationToken: 'new-registration' },
    });
    await actions.signIn({ provider: 'google' });
    if (end === 'resolve') {
      response.resolve({ data: signedInResponse(1) });
    } else {
      response.reject(new Error('network'));
    }
    await expect(signup).resolves.toEqual({ status: 'CANCELLED' });
    vi.mocked(runtime.register).mockResolvedValue({ data: signedInResponse(2) });
    await expect(actions.completeSignup(signupInput)).resolves.toMatchObject({
      status: 'SIGNED_IN',
    });
    expect(runtime.register).toHaveBeenLastCalledWith({
      body: {
        registrationToken: 'new-registration',
        name: signupInput.name,
        phoneNumber: '+821012345678',
      },
    });
  });

  it('가입 진행 중 로그인·가입 중복을 막고 실패 뒤 다시 시도할 수 있다', async () => {
    const { runtime, actions } = googleActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signupRequiredResponse });
    await actions.signIn({ provider: 'google' });
    const response = Promise.withResolvers<{ data: AuthenticationResponse }>();
    vi.mocked(runtime.register).mockReturnValueOnce(response.promise);
    const signup = actions.completeSignup(signupInput);
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({ code: 'BUSY' });
    await expect(actions.completeSignup(signupInput)).resolves.toMatchObject({ code: 'BUSY' });
    response.reject(new Error('network'));
    await expect(signup).rejects.toThrow('network');
    vi.mocked(runtime.register).mockResolvedValue({ data: signedInResponse(2) });
    await expect(actions.completeSignup(signupInput)).resolves.toMatchObject({
      status: 'SIGNED_IN',
    });
    expect(runtime.register).toHaveBeenCalledTimes(2);
  });

  it('이전 로그인 finally가 새 로그인의 중복 방지를 해제하지 않는다', async () => {
    const { runtime, actions } = googleActions();
    const old = Promise.withResolvers<{ data: AuthenticationResponse }>();
    const started = Promise.withResolvers<void>();
    vi.mocked(runtime.authenticateGoogle).mockImplementationOnce(() => {
      started.resolve();
      return old.promise;
    });
    const first = actions.signIn({ provider: 'google' });
    await started.promise;
    await actions.signOut();
    const next = Promise.withResolvers<NativeIdentity>();
    vi.mocked(runtime.authenticateWithProvider).mockReturnValueOnce(next.promise);
    const second = actions.signIn({ provider: 'google' });
    old.resolve({ data: signedInResponse(1) });
    await expect(first).resolves.toEqual({ status: 'CANCELLED' });
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({ code: 'BUSY' });
    next.resolve(googleIdentity);
    await expect(second).resolves.toMatchObject({ status: 'SIGNED_IN' });
  });

  it('로그아웃의 저장소 삭제 실패를 성공으로 숨기지 않는다', async () => {
    const { actions } = googleActions();
    await actions.signIn({ provider: 'google' });
    storage.clearSession.mockRejectedValue(new Error('storage'));
    await expect(actions.signOut()).resolves.toMatchObject({ code: 'STORAGE' });
    await expect(actions.getSession()).resolves.toMatchObject({ code: 'STORAGE' });
  });

  it('외부에서 확정한 새 세션을 이전 로그아웃 응답으로 삭제하지 않는다', async () => {
    const { runtime, actions } = googleActions();
    await actions.signIn({ provider: 'google' });
    const revoke = Promise.withResolvers<Awaited<ReturnType<NativeAuthRuntime['revoke']>>>();
    vi.mocked(runtime.revoke).mockReturnValue(revoke.promise);
    const logout = actions.signOut();
    await vi.waitFor(() => expect(runtime.revoke).toHaveBeenCalledOnce());
    await runtime.session.establish(
      {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        userId: 8,
        expiresAt: Date.now() + 3_600_000,
      },
      runtime.session.captureGeneration(),
    );
    revoke.resolve({ ok: true });
    await expect(logout).resolves.toEqual({ status: 'CANCELLED' });
    expect(runtime.session.refreshToken).toBe('new-refresh');
    expect(storage.clearSession).not.toHaveBeenCalled();
  });

  it('renew 401이면 현재 자격을 삭제하고 이후 같은 토큰으로 갱신하지 않는다', async () => {
    const { actions, runtime, http, session } = await renewalActions();
    http.mockResolvedValue(new Response('{}', { status: 401 }));
    await expect(actions.refreshSession(session)).resolves.toEqual({ status: 'SIGNED_OUT' });
    expect(runtime.session.refreshToken).toBeUndefined();
    expect(storage.clearSession).toHaveBeenCalledOnce();
    await expect(actions.getSession()).resolves.toEqual({ status: 'SIGNED_OUT' });
    expect(http).toHaveBeenCalledTimes(1);
  });

  it.each([
    [400, '{}', 'SERVER', false],
    [403, '{}', 'SERVER', false],
    [500, '{}', 'SERVER', true],
    [503, '{}', 'SERVER', true],
    [200, '{}', 'INVALID_RESPONSE', false],
    [200, 'invalid-json', 'INVALID_RESPONSE', false],
    [204, null, 'INVALID_RESPONSE', false],
  ] as const)(
    'renew %i 응답(%s)을 %s로 구분하고 자격을 보존한다',
    async (status, body, code, retryable) => {
      const { actions, runtime, http, session } = await renewalActions();
      http.mockResolvedValue(
        new Response(body, { status, headers: { 'Content-Type': 'application/json' } }),
      );
      await expect(actions.refreshSession(session)).resolves.toEqual({
        status: 'UNAVAILABLE',
        code,
        retryable,
      });
      expect(runtime.session.refreshToken).toBe('refresh-1');
      expect(storage.clearSession).not.toHaveBeenCalled();
      expect(http).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['accessToken', 'refreshToken', 'expiresIn', 'expiresAt'])(
    'renew 200의 잘못된 %s를 저장하지 않는다',
    async (field) => {
      const { actions, runtime, http, session } = await renewalActions();
      const valid = signedInResponse(2);
      let expiresIn = 3600;
      if (field === 'expiresIn') {
        expiresIn = -1;
      } else if (field === 'expiresAt') {
        expiresIn = Number.MAX_SAFE_INTEGER;
      }
      const data = {
        ...valid,
        session: {
          ...valid.session,
          accessToken: field === 'accessToken' ? '' : 'access-2',
          refreshToken: field === 'refreshToken' ? ' ' : 'refresh-2',
          expiresIn,
        },
      };
      http.mockResolvedValue(Response.json(data));
      await expect(actions.refreshSession(session)).resolves.toMatchObject({
        code: 'INVALID_RESPONSE',
      });
      expect(runtime.session.refreshToken).toBe('refresh-1');
      expect(storage.setSession).toHaveBeenCalledTimes(1);
    },
  );

  it('user 없는 갱신 응답도 로그인 계정과 새 토큰을 유지한다', async () => {
    const { actions, http, session } = await renewalActions();
    http.mockResolvedValueOnce(Response.json({ ...signedInResponse(2), user: null }));
    await expect(actions.refreshSession(session)).resolves.toMatchObject({
      status: 'SIGNED_IN',
      session: { userId: 7, accessToken: 'access-2', tokenVersion: 2, name: '테스트 사용자' },
    });
  });

  it('재실행 뒤 user 없는 갱신 응답으로 같은 계정을 복구하고 새 토큰을 저장한다', async () => {
    const { actions, http, session } = await renewalActions();
    let persisted: StoredSession | null = { refreshToken: 'refresh-1', userId: 7 };
    storage.setSession.mockImplementation((value) => {
      persisted = value;
      return Promise.resolve();
    });
    storage.getSession.mockImplementation(() => Promise.resolve(persisted));
    http.mockResolvedValueOnce(Response.json({ ...signedInResponse(2), user: null }));
    await actions.refreshSession(session);
    const runtime = createRuntime();
    vi.mocked(runtime.renew).mockImplementation((input) =>
      nativeAuthApi.renew({
        ...input,
        baseUrl: 'https://api.test',
        kyOptions: { fetch: http },
      }),
    );
    http.mockResolvedValueOnce(Response.json({ ...signedInResponse(3), user: null }));
    const restarted = new AuthActions(runtime);
    await expect(restarted.getSession()).resolves.toMatchObject({
      status: 'SIGNED_IN',
      session: { userId: 7, accessToken: 'access-3', name: '테스트 사용자' },
    });
    expect(runtime.renew).toHaveBeenCalledWith({ body: { refreshToken: 'refresh-2' } });
    expect(persisted).toEqual({ refreshToken: 'refresh-3', userId: 7, name: '테스트 사용자' });
  });

  it('로그인은 사용자 정보가 없으면 토큰을 저장하지 않는다', async () => {
    const { runtime, actions } = googleActions();
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({
      data: { ...signedInResponse(1), user: null },
    });
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
    expect(storage.setSession).not.toHaveBeenCalled();
  });

  it('renew 네트워크 실패 뒤 자격을 보존하고 다음 시도에서 회전한다', async () => {
    const { actions, runtime, http, session } = await renewalActions();
    http.mockRejectedValueOnce(new TypeError('network'));
    await expect(actions.refreshSession(session)).resolves.toMatchObject({
      code: 'NETWORK',
      retryable: true,
    });
    expect(runtime.session.refreshToken).toBe('refresh-1');
    http.mockResolvedValueOnce(Response.json(signedInResponse(2)));
    await expect(actions.refreshSession(session)).resolves.toMatchObject({
      status: 'SIGNED_IN',
      session: { tokenVersion: 2 },
    });
    expect(runtime.session.refreshToken).toBe('refresh-2');
    expect(http).toHaveBeenCalledTimes(2);
  });

  it('renew의 20초 timeout을 구분하고 자격을 보존한다', async () => {
    const { actions, runtime, http, session } = await renewalActions();
    vi.useFakeTimers();
    try {
      http.mockImplementation(() => new Promise<Response>(() => {}));
      const refreshing = actions.refreshSession(session);
      await vi.advanceTimersByTimeAsync(20_001);
      await expect(refreshing).resolves.toMatchObject({ code: 'TIMEOUT', retryable: true });
      expect(runtime.session.refreshToken).toBe('refresh-1');
      expect(http).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('새 로그인 뒤 도착한 renew 401은 새 자격을 지우지 않는다', async () => {
    const { actions, runtime, http, session } = await renewalActions();
    const response = Promise.withResolvers<Response>();
    const started = Promise.withResolvers<void>();
    http.mockImplementation(() => {
      started.resolve();
      return response.promise;
    });
    const refreshing = actions.refreshSession(session);
    await started.promise;
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signedInResponse(2) });
    await actions.signIn({ provider: 'google' });
    response.resolve(new Response('{}', { status: 401 }));
    await expect(refreshing).resolves.toEqual({ status: 'CANCELLED' });
    expect(runtime.session.refreshToken).toBe('refresh-2');
    expect(storage.clearSession).not.toHaveBeenCalled();
  });

  it('renew 401의 삭제 실패를 STORAGE로 보고하고 재복구를 차단한다', async () => {
    const { actions, http, session } = await renewalActions();
    http.mockResolvedValue(new Response('{}', { status: 401 }));
    storage.clearSession.mockRejectedValue(new Error('storage'));
    await expect(actions.refreshSession(session)).resolves.toMatchObject({ code: 'STORAGE' });
    await expect(actions.getSession()).resolves.toMatchObject({ code: 'STORAGE' });
    expect(http).toHaveBeenCalledTimes(1);
  });
});
