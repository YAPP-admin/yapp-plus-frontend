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
});
