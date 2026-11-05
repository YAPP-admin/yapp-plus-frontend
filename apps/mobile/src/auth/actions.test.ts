/** AuthActions가 공급자 인증·가입·세션 경계를 올바른 브리지 결과로 변환하는지 검증합니다. */

import type { AuthenticationResponse } from '@yapp-plus/api/generated';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthActions, type NativeAuthRuntime } from './actions';
import type { NativeIdentity } from './providers';
import { SessionManager } from './session';

const storage = vi.hoisted(() => ({
  clearSession: vi.fn<() => Promise<void>>(),
  getRefreshToken: vi.fn<() => Promise<string | null>>(),
  setRefreshToken: vi.fn<(token: string) => Promise<void>>(),
}));

vi.mock('./storage', () => ({ authStorage: storage }));

const signedInResponse = (version: number): AuthenticationResponse => ({
  result: 'SIGNED_IN',
  user: { id: 7, name: '테스트 사용자', phoneNumber: '+821012345678' },
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
  revoke: vi.fn<NativeAuthRuntime['revoke']>(),
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

describe('AuthActions', () => {
  beforeEach(() => {
    storage.clearSession.mockReset().mockResolvedValue(undefined);
    storage.getRefreshToken.mockReset().mockResolvedValue(null);
    storage.setRefreshToken.mockReset().mockResolvedValue(undefined);
  });

  it('공급자 credential을 생성 API에 전달하고 세션을 시작한다', async () => {
    const runtime = createRuntime();
    vi.mocked(runtime.authenticateWithProvider).mockResolvedValue(googleIdentity);
    vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signedInResponse(1) });
    const actions = new AuthActions(runtime);

    const result = await actions.signIn({ provider: 'google' });

    expect(result).toMatchObject({ status: 'SIGNED_IN', session: { accessToken: 'access-1' } });
    expect(runtime.authenticateGoogle).toHaveBeenCalledWith({
      body: { idToken: 'google-id-token', nonce: 'raw-nonce' },
    });
    expect(storage.setRefreshToken).toHaveBeenCalledWith('refresh-1');
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
    ).resolves.toMatchObject({ status: 'SIGNED_IN' });

    expect(runtime.register).toHaveBeenCalledWith({
      body: {
        registrationToken: 'registration-token',
        name: '테스트 사용자',
        phoneNumber: '+821012345678',
      },
    });
  });

  it('로그아웃은 서버 revoke 실패 여부와 관계없이 로컬 세션을 제거한다', async () => {
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
    expect(storage.setRefreshToken).not.toHaveBeenCalled();
  });

  it.each(['resolve', 'reject'])(
    'revoke %s 대기 전에 정리하고 새 로그인은 보존한다',
    async (end) => {
      const { runtime, actions } = googleActions();
      await actions.signIn({ provider: 'google' });
      const revoke = Promise.withResolvers<{ error?: unknown }>();
      vi.mocked(runtime.revoke).mockReturnValue(revoke.promise);
      const deleting = Promise.withResolvers<void>();
      storage.clearSession.mockImplementation(() => {
        deleting.resolve();
        return Promise.resolve();
      });
      const logout = actions.signOut();
      expect(runtime.session.accessToken).toBeUndefined();
      await deleting.promise;
      vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signedInResponse(2) });
      await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
        status: 'SIGNED_IN',
      });
      if (end === 'resolve') {
        revoke.resolve({});
      } else {
        revoke.reject(new Error('network'));
      }
      await expect(logout).resolves.toEqual({ status: 'CANCELLED' });
      expect(runtime.revoke).toHaveBeenCalledWith({ body: { refreshToken: 'refresh-1' } });
      expect(runtime.session.refreshToken).toBe('refresh-2');
      expect(storage.clearSession).toHaveBeenCalledTimes(1);
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

  it.each(['pending', 'signup-required'])(
    '늦은 로그아웃 결과가 새 인증 %s를 덮지 않는다',
    async (phase) => {
      const { runtime, actions } = googleActions();
      await actions.signIn({ provider: 'google' });
      const revoke = Promise.withResolvers<{ error?: unknown }>();
      vi.mocked(runtime.revoke).mockReturnValue(revoke.promise);
      const logout = actions.signOut();
      const provider = Promise.withResolvers<NativeIdentity>();
      vi.mocked(runtime.authenticateWithProvider).mockReturnValue(provider.promise);
      vi.mocked(runtime.authenticateGoogle).mockResolvedValue({ data: signupRequiredResponse });
      const login = actions.signIn({ provider: 'google' });
      if (phase === 'signup-required') {
        provider.resolve(googleIdentity);
        await login;
      }
      revoke.resolve({});
      await expect(logout).resolves.toEqual({ status: 'CANCELLED' });
      provider.resolve(googleIdentity);
      await expect(login).resolves.toMatchObject({ status: 'SIGNUP_REQUIRED' });
      vi.mocked(runtime.register).mockResolvedValue({ data: signedInResponse(2) });
      await expect(actions.completeSignup(signupInput)).resolves.toMatchObject({
        status: 'SIGNED_IN',
      });
    },
  );
});
