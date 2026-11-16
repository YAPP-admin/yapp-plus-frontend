/** 생성 SDK 어댑터가 204와 한 번의 401 갱신만 성공으로 취급하는지 검증합니다. */

import { register, remove } from '@yapp-plus/api/generated';
import { beforeEach, expect, it, vi } from 'vitest';

import { createNotificationApi } from './notification-api';
import type { AuthRequestRuntime } from '../auth/authenticated-request';
import { SessionManager, type RenewalResult } from '../auth/session';
import type { AuthResult } from '@yapp-plus/app-bridge';

it.each([
  [{ status: 'UNAVAILABLE', code: 'NETWORK', retryable: true }, 'NETWORK'],
  [{ status: 'UNAVAILABLE', code: 'TIMEOUT', retryable: true }, 'NETWORK'],
  [{ status: 'UNAVAILABLE', code: 'SERVER', retryable: true }, 'SERVER'],
  [{ status: 'UNAVAILABLE', code: 'INVALID_RESPONSE', retryable: false }, 'SERVER'],
  [{ status: 'ERROR', code: 'STORAGE', retryable: true }, 'STORAGE'],
  [{ status: 'CANCELLED' }, 'CANCELLED'],
  [{ status: 'SIGNED_OUT' }, 'AUTH_REQUIRED'],
] satisfies [AuthResult, string][])(
  '401 갱신 실패 원인을 보존하고 재요청하지 않는다: %s',
  async (result, code) => {
    vi.mocked(register).mockResolvedValue(sdkResponse(401));
    const api = createNotificationApi({
      getSessionSnapshot: () => input,
      refreshSession: vi.fn<AuthRequestRuntime['refreshSession']>().mockResolvedValue(result),
    });
    await expect(api.registerDevice(input)).resolves.toEqual({ ok: false, code });
    expect(register).toHaveBeenCalledOnce();
  },
);

it('세션 구독은 확정·갱신·삭제를 알리고 단순 조회는 다시 알리지 않는다', async () => {
  const manager = new SessionManager();
  const listener = vi.fn<() => void>();
  const unsubscribe = manager.subscribe(listener);
  await manager.establish(
    { userId: 1, accessToken: 'a1', refreshToken: 'r1', expiresAt: Date.now() + 60_000 },
    manager.captureGeneration(),
  );
  const renew = vi.fn<() => Promise<RenewalResult>>().mockResolvedValue({
    kind: 'success',
    tokens: { accessToken: 'a2', refreshToken: 'r2', expiresAt: Date.now() + 60_000 },
  });
  await manager.get(renew);
  expect(listener).toHaveBeenCalledOnce();
  await manager.refresh(undefined, renew);
  expect(listener).toHaveBeenCalledTimes(2);
  await manager.clear();
  expect(manager.snapshot).toBeUndefined();
  expect(listener).toHaveBeenCalledTimes(3);
  unsubscribe();
  await manager.clear();
  expect(listener).toHaveBeenCalledTimes(3);
});

vi.mock('expo-crypto', () => ({ randomUUID: () => 'session-1' }));
vi.mock('../auth/storage', () => ({
  authStorage: {
    setSession: vi.fn<() => Promise<void>>(),
    clearSession: vi.fn<() => Promise<void>>(),
  },
}));

vi.mock('@yapp-plus/api/generated', () => ({
  register: vi.fn<typeof register>(),
  remove: vi.fn<typeof remove>(),
}));

const input = {
  userId: 1,
  sessionId: 'session-1',
  tokenVersion: 1,
  accessToken: 'access-1',
  installationId: 'fid-1',
  registrationToken: 'fcm-1',
};
const sdkResponse = (status: number) => ({
  data: undefined,
  error: undefined,
  request: new Request('https://api.test'),
  response: new Response(null, { status }),
});

beforeEach(() => {
  vi.resetAllMocks();
});

it('204 응답만 기기 등록 성공으로 처리한다', async () => {
  vi.mocked(register).mockResolvedValue(sdkResponse(204));
  const api = createNotificationApi({
    getSessionSnapshot: () => input,
    refreshSession: vi.fn<AuthRequestRuntime['refreshSession']>().mockResolvedValue({
      status: 'SIGNED_IN',
      session: {
        ...input,
        expiresAt: Date.now() + 60_000,
        accessToken: 'access-2',
        tokenVersion: 2,
      },
    }),
  });

  await expect(api.registerDevice(input)).resolves.toEqual({ ok: true });
  expect(register).toHaveBeenCalledWith(
    expect.objectContaining({
      path: { installationId: 'fid-1' },
      body: { platform: 'IOS', registrationToken: 'fcm-1' },
      headers: { Authorization: 'Bearer access-1' },
    }),
  );
});

it('401은 최신 access token으로 한 번만 재시도한다', async () => {
  vi.mocked(remove).mockResolvedValueOnce(sdkResponse(401)).mockResolvedValueOnce(sdkResponse(204));
  const refreshSession = vi.fn<AuthRequestRuntime['refreshSession']>().mockResolvedValue({
    status: 'SIGNED_IN',
    session: { ...input, expiresAt: Date.now() + 60_000, accessToken: 'access-2', tokenVersion: 2 },
  });
  const api = createNotificationApi({ refreshSession, getSessionSnapshot: () => input });

  await expect(api.removeDevice(input)).resolves.toEqual({ ok: true });
  expect(refreshSession).toHaveBeenCalledWith({ sessionId: 'session-1', tokenVersion: 1 });
  expect(remove).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ headers: { Authorization: 'Bearer access-2' } }),
  );
});

it('409와 재시도 뒤 401을 성공으로 숨기지 않는다', async () => {
  vi.mocked(register).mockResolvedValue(sdkResponse(409));
  const api = createNotificationApi({
    getSessionSnapshot: () => input,
    refreshSession: vi.fn<AuthRequestRuntime['refreshSession']>().mockResolvedValue({
      status: 'SIGNED_IN',
      session: {
        ...input,
        expiresAt: Date.now() + 60_000,
        accessToken: 'access-2',
        tokenVersion: 2,
      },
    }),
  });
  await expect(api.registerDevice(input)).resolves.toEqual({ ok: false, code: 'CONFLICT' });

  vi.mocked(register)
    .mockResolvedValueOnce(sdkResponse(401))
    .mockResolvedValueOnce(sdkResponse(401));
  await expect(api.registerDevice(input)).resolves.toEqual({ ok: false, code: 'AUTH_REQUIRED' });
  expect(register).toHaveBeenCalledTimes(3);
});

it.each([{ userId: 2 }, { sessionId: 'other' }, { tokenVersion: 0 }])(
  '갱신 결과가 요청 계정·세션·버전과 맞지 않으면 폐기한다: %s',
  async (changed) => {
    vi.mocked(register).mockResolvedValue(sdkResponse(401));
    const api = createNotificationApi({
      getSessionSnapshot: () => input,
      refreshSession: vi.fn<AuthRequestRuntime['refreshSession']>().mockResolvedValue({
        status: 'SIGNED_IN',
        session: { ...input, expiresAt: Date.now() + 60_000, ...changed },
      }),
    });
    await expect(api.registerDevice(input)).resolves.toEqual({ ok: false, code: 'CANCELLED' });
    expect(register).toHaveBeenCalledOnce();
  },
);

it('브리지와 알림의 동시 401은 실제 SessionManager의 한 번의 갱신을 공유한다', async () => {
  const manager = new SessionManager();
  const established = await manager.establish(
    {
      userId: 1,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      expiresAt: Date.now() + 60_000,
    },
    manager.captureGeneration(),
  );
  if (established.status !== 'SIGNED_IN') {
    throw new Error('세션 준비 실패');
  }
  const session = established.session;
  const pending = Promise.withResolvers<RenewalResult>();
  const renew = vi.fn<() => Promise<RenewalResult>>(() => pending.promise);
  vi.mocked(register)
    .mockResolvedValueOnce(sdkResponse(401))
    .mockResolvedValueOnce(sdkResponse(204));
  const refreshSession = vi.fn<AuthRequestRuntime['refreshSession']>((request) =>
    manager.refresh(request, renew),
  );
  const api = createNotificationApi({ getSessionSnapshot: () => manager.snapshot, refreshSession });
  const bridge = manager.refresh(session, renew);
  const notification = api.registerDevice({
    ...session,
    installationId: 'fid',
    registrationToken: 'fcm',
  });
  await vi.waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());
  pending.resolve({
    kind: 'success',
    tokens: { accessToken: 'access-2', refreshToken: 'refresh-2', expiresAt: Date.now() + 60_000 },
  });
  await bridge;
  await expect(notification).resolves.toEqual({ ok: true });
  expect(renew).toHaveBeenCalledOnce();
  // 뒤늦은 같은 버전의 401도 추가 갱신 없이 최신 토큰으로 복구합니다.
  vi.mocked(register)
    .mockResolvedValueOnce(sdkResponse(401))
    .mockResolvedValueOnce(sdkResponse(204));
  await expect(
    api.registerDevice({ ...session, installationId: 'fid', registrationToken: 'fcm' }),
  ).resolves.toEqual({ ok: true });
  expect(renew).toHaveBeenCalledOnce();
});

it('응답 대기 중 로그아웃되면 401 갱신을 시작하지 않는다', async () => {
  let current = true;
  const pending = Promise.withResolvers<ReturnType<typeof sdkResponse>>();
  vi.mocked(register).mockReturnValueOnce(pending.promise);
  const refreshSession = vi.fn<AuthRequestRuntime['refreshSession']>();
  const api = createNotificationApi({
    getSessionSnapshot: () => (current ? input : undefined),
    refreshSession,
  });
  const request = api.registerDevice(input);
  current = false;
  pending.resolve(sdkResponse(401));
  await expect(request).resolves.toEqual({ ok: false, code: 'CANCELLED' });
  expect(refreshSession).not.toHaveBeenCalled();
});
