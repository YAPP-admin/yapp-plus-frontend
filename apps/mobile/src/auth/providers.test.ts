/** 앱의 Google 초기화 설정과 플랫폼별 인증 경로를 검증합니다. */
import { createHash, randomUUID } from 'node:crypto';
import { beforeEach, expect, it, vi } from 'vitest';
import config from '../../app.config';
import { AuthActions, type NativeAuthRuntime } from './actions';
import { SessionManager } from './session';
import { authenticateWithProvider } from './providers';

type GoogleResponse =
  | { type: 'success'; data: { idToken: string } }
  | { type: 'cancelled' | 'noSavedCredentialFound' };
const mocks = vi.hoisted(() => ({
  platform: { OS: 'ios' },
  random: vi.fn<(length: number) => Promise<Uint8Array>>(),
  google: {
    configure:
      vi.fn<(input: { iosClientId?: string; webClientId: string; nonce: string }) => void>(),
    signIn: vi.fn<() => Promise<GoogleResponse>>(),
    createAccount: vi.fn<() => Promise<GoogleResponse>>(),
    presentExplicitSignIn: vi.fn<() => Promise<GoogleResponse>>(),
  },
}));
const google = mocks.google;
const success = (idToken: string): GoogleResponse => ({ type: 'success', data: { idToken } });
const noSaved: GoogleResponse = { type: 'noSavedCredentialFound' };
vi.mock('./storage', () => ({
  authStorage: {
    getSession: () => Promise.resolve(null),
    setSession: () => Promise.resolve(),
    clearSession: () => Promise.resolve(),
  },
}));
vi.mock('react-native', () => ({ Platform: mocks.platform }));
vi.mock('expo-apple-authentication', () => ({}));
vi.mock('expo-crypto', () => ({
  randomUUID,
  getRandomBytesAsync: mocks.random,
  digestStringAsync: (_algorithm: string, raw: string) =>
    Promise.resolve(createHash('sha256').update(raw).digest('hex')),
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
  CryptoEncoding: { HEX: 'hex' },
}));
vi.mock('react-native-nitro-google-signin', () => ({
  GoogleOneTapSignIn: mocks.google,
  isCancelledResponse: (response: GoogleResponse) => response.type === 'cancelled',
  isNoSavedCredentialFoundResponse: (response: GoogleResponse) =>
    response.type === 'noSavedCredentialFound',
  isSuccessResponse: (response: GoogleResponse) => response.type === 'success',
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.platform.OS = 'ios';
  let sequence = 0;
  mocks.random.mockImplementation((length) =>
    Promise.resolve(new Uint8Array(length).fill(++sequence)),
  );
  google.signIn.mockResolvedValue(success('cached-token'));
  google.createAccount.mockResolvedValue(success('account-token'));
  google.presentExplicitSignIn.mockResolvedValue(success('explicit-token'));
});

it('iOS client ID・URL scheme・web audience를 유지하고 명시적 로그인 전에 구성한다', async () => {
  await expect(authenticateWithProvider('google')).resolves.toMatchObject({
    provider: 'google',
    idToken: 'explicit-token',
    nonce: '01'.repeat(32),
  });
  const iosClientId = '47093355379-s1gkq650qpgjhvsb2bev9h4na5mlmnsi.apps.googleusercontent.com';
  expect(google.configure).toHaveBeenCalledWith({
    iosClientId,
    webClientId: '47093355379-bl1tgba0nj3sn5610bn01aeqc7mm4ljb.apps.googleusercontent.com',
    nonce: createHash('sha256').update('01'.repeat(32)).digest('hex'),
  });
  expect(google.configure).toHaveBeenCalledBefore(google.presentExplicitSignIn);
  expect(google.signIn).not.toHaveBeenCalled();
  expect(google.createAccount).not.toHaveBeenCalled();
  expect(config.plugins).toContainEqual([
    'react-native-nitro-google-signin',
    { iosUrlScheme: iosClientId.split('.').toReversed().join('.') },
  ]);
});

it('연속 로그인 시도마다 새 nonce와 해당 명시적 로그인 응답을 연결한다', async () => {
  google.presentExplicitSignIn
    .mockResolvedValueOnce(success('first-token'))
    .mockResolvedValueOnce(success('second-token'));
  const first = await authenticateWithProvider('google');
  const second = await authenticateWithProvider('google');
  expect(first.nonce).not.toBe(second.nonce);
  for (const [index, identity] of [first, second].entries()) {
    expect(google.configure).toHaveBeenNthCalledWith(
      index + 1,
      expect.objectContaining({ nonce: createHash('sha256').update(identity.nonce).digest('hex') }),
    );
  }
  expect(first).toMatchObject({ idToken: 'first-token' });
  expect(second).toMatchObject({ idToken: 'second-token' });
  expect(google.signIn).not.toHaveBeenCalled();
});

it('Google 실패 후 재시도도 새 nonce로 요청한다', async () => {
  google.presentExplicitSignIn.mockRejectedValueOnce(new Error('provider failed'));
  await expect(authenticateWithProvider('google')).rejects.toMatchObject({
    code: 'PROVIDER_FAILURE',
  });
  await expect(authenticateWithProvider('google')).resolves.toMatchObject({
    nonce: '02'.repeat(32),
  });
  expect(google.presentExplicitSignIn).toHaveBeenCalledTimes(2);
  expect(google.signIn).not.toHaveBeenCalled();
});

it('사용자 취소를 CANCELLED로 전달하고 다른 로그인 경로로 재시도하지 않는다', async () => {
  google.presentExplicitSignIn.mockResolvedValueOnce({ type: 'cancelled' });
  await expect(authenticateWithProvider('google')).rejects.toMatchObject({ code: 'CANCELLED' });
  expect(google.signIn).not.toHaveBeenCalled();
  expect(google.createAccount).not.toHaveBeenCalled();
  expect(google.presentExplicitSignIn).toHaveBeenCalledTimes(1);
});

it('명시적 로그인에서 자격이 없으면 캐시 경로로 돌아가지 않는다', async () => {
  google.presentExplicitSignIn.mockResolvedValueOnce(noSaved);
  await expect(authenticateWithProvider('google')).rejects.toMatchObject({
    code: 'CREDENTIAL_MISSING',
  });
  expect(google.signIn).not.toHaveBeenCalled();
  expect(google.createAccount).not.toHaveBeenCalled();
});

it.each([
  ['저장 자격', false, false, 'cached-token', 0, 0],
  ['계정 생성', true, false, 'account-token', 1, 0],
  ['명시적 fallback', true, true, 'explicit-token', 1, 1],
] as const)(
  'Android의 기존 %s 경로를 유지한다',
  async (_label, missing, accountMissing, token, accounts, explicit) => {
    mocks.platform.OS = 'android';
    if (missing) {
      google.signIn.mockResolvedValueOnce(noSaved);
    }
    if (accountMissing) {
      google.createAccount.mockResolvedValueOnce(noSaved);
    }
    await expect(authenticateWithProvider('google')).resolves.toMatchObject({ idToken: token });
    expect(google.signIn).toHaveBeenCalledTimes(1);
    expect(google.createAccount).toHaveBeenCalledTimes(accounts);
    expect(google.presentExplicitSignIn).toHaveBeenCalledTimes(explicit);
  },
);

it.each(['서버 실패 후 재시도', '로그아웃 후 재로그인'] as const)(
  '%s에서 새 nonce를 서버에 전달한다',
  async (scenario) => {
    const authenticateGoogle = vi.fn<NativeAuthRuntime['authenticateGoogle']>().mockResolvedValue({
      data: {
        result: 'SIGNED_IN',
        user: { id: 7, name: '테스트', phoneNumber: '+821012345678' },
        session: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 3600 },
        registrationToken: null,
        expiresIn: null,
      },
    });
    const runtime: NativeAuthRuntime = {
      session: new SessionManager(),
      authenticateWithProvider,
      authenticateGoogle,
      authenticateApple: vi.fn<NativeAuthRuntime['authenticateApple']>(),
      register: vi.fn<NativeAuthRuntime['register']>(),
      renew: vi.fn<NativeAuthRuntime['renew']>(),
      revoke: vi.fn<NativeAuthRuntime['revoke']>().mockResolvedValue({}),
      withdraw: vi.fn<NativeAuthRuntime['withdraw']>(),
    };
    const actions = new AuthActions(runtime);
    const failedFirst = scenario === '서버 실패 후 재시도';
    if (failedFirst) {
      authenticateGoogle.mockRejectedValueOnce(new Error('server unavailable'));
    }
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: failedFirst ? 'UNAVAILABLE' : 'SIGNED_IN',
    });
    const logout = failedFirst ? undefined : await actions.signOut();
    expect(logout).toEqual(failedFirst ? undefined : { status: 'SIGNED_OUT' });
    await expect(actions.signIn({ provider: 'google' })).resolves.toMatchObject({
      status: 'SIGNED_IN',
    });
    expect(authenticateGoogle).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        body: expect.objectContaining({ nonce: '02'.repeat(32), idToken: 'explicit-token' }),
      }),
    );
    expect(google.presentExplicitSignIn).toHaveBeenCalledTimes(2);
    expect(google.signIn).not.toHaveBeenCalled();
  },
);
