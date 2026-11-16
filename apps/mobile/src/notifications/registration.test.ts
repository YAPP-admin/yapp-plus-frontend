/** 알림 등록 조율의 직렬화·서버 성공·OFF 해제·충돌·세션 경계를 검증합니다. */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationRegistration, type NotificationRegistrationApi } from './registration';

const selection = { enabled: true };
const storage = {
  getSelection:
    vi.fn<(firebaseProjectId: string, installationId: string) => Promise<{ enabled: boolean }>>(),
  setSelection:
    vi.fn<
      (
        firebaseProjectId: string,
        installationId: string,
        selection: { enabled: boolean },
      ) => Promise<void>
    >(),
};
const api = {
  registerDevice: vi.fn<NotificationRegistrationApi['registerDevice']>(),
  removeDevice: vi.fn<NotificationRegistrationApi['removeDevice']>(),
} satisfies NotificationRegistrationApi;

const input = (overrides: Partial<Parameters<NotificationRegistration['sync']>[0]> = {}) => ({
  firebaseProjectId: 'yapp-plus',
  installationId: 'fid-1',
  getToken: () => Promise.resolve('fcm-token-1'),
  getPermission: () => Promise.resolve('allowed' as const),
  requestPermission: () => Promise.resolve('allowed' as const),
  session: { sessionId: 'session-1', userId: 1, tokenVersion: 1, accessToken: 'access-token-1' },
  isSessionCurrent: () => true,
  ...overrides,
});

let registration: NotificationRegistration;

beforeEach(() => {
  vi.resetAllMocks();
  storage.getSelection.mockResolvedValue(selection);
  storage.setSelection.mockResolvedValue(undefined);
  api.registerDevice.mockResolvedValue({ ok: true });
  api.removeDevice.mockResolvedValue({ ok: true });
  registration = new NotificationRegistration(storage, api);
});

describe('자동 동기화', () => {
  it('DELETE 응답 유실 뒤 권한이 복구되면 같은 토큰도 다시 등록한다', async () => {
    await registration.sync(input());
    api.removeDevice.mockResolvedValueOnce({ ok: false, code: 'NETWORK' });
    await expect(
      registration.sync(input({ getPermission: () => Promise.resolve('blocked') })),
    ).resolves.toEqual({ ok: false, code: 'NETWORK' });

    await registration.sync(input());
    expect(api.registerDevice).toHaveBeenCalledTimes(2);
  });

  it('OFF는 권한 SDK가 실패하더라도 조회 없이 등록을 해제한다', async () => {
    storage.getSelection.mockResolvedValue({ enabled: false });
    const getPermission = vi
      .fn<Parameters<NotificationRegistration['sync']>[0]['getPermission']>()
      .mockRejectedValue(new Error('permission unavailable'));

    await expect(registration.sync(input({ getPermission }))).resolves.toEqual({
      ok: true,
      enabled: false,
    });
    expect(getPermission).not.toHaveBeenCalled();
    expect(api.removeDevice).toHaveBeenCalledOnce();
  });

  it('같은 세션·FID·FCM token의 성공한 PUT은 한 번만 보낸다', async () => {
    await expect(registration.sync(input())).resolves.toEqual({ ok: true, enabled: true });
    await expect(registration.sync(input())).resolves.toEqual({ ok: true, enabled: true });

    expect(api.registerDevice).toHaveBeenCalledTimes(1);
    expect(api.registerDevice).toHaveBeenCalledWith({
      sessionId: 'session-1',
      userId: 1,
      tokenVersion: 1,
      accessToken: 'access-token-1',
      installationId: 'fid-1',
      registrationToken: 'fcm-token-1',
    });
  });

  it('OFF 선택은 이전 성공 여부와 무관하게 매번 DELETE한다', async () => {
    storage.getSelection.mockResolvedValue({ enabled: false });

    await registration.sync(input());
    await registration.sync(input());

    expect(api.removeDevice).toHaveBeenCalledTimes(2);
    expect(api.registerDevice).not.toHaveBeenCalled();
  });

  it('등록 충돌은 FID를 바꾸지 않고 CONFLICT로 반환한다', async () => {
    api.registerDevice.mockResolvedValue({ ok: false, code: 'CONFLICT' });

    await expect(registration.sync(input())).resolves.toEqual({ ok: false, code: 'CONFLICT' });
    expect(api.registerDevice).toHaveBeenCalledWith(
      expect.objectContaining({ installationId: 'fid-1' }),
    );
  });

  it('세션 경계 뒤에 도착한 등록 성공은 현재 캐시로 쓰지 않는다', async () => {
    const pending =
      Promise.withResolvers<Awaited<ReturnType<NotificationRegistrationApi['registerDevice']>>>();
    const started = Promise.withResolvers<void>();
    let current = true;
    api.registerDevice.mockImplementation(() => {
      started.resolve();
      return pending.promise;
    });

    const first = registration.sync(input({ isSessionCurrent: () => current }));
    await started.promise;
    current = false;
    pending.resolve({ ok: true });

    await expect(first).resolves.toEqual({ ok: false, code: 'CANCELLED' });
    await registration.sync(
      input({
        session: {
          sessionId: 'session-2',
          userId: 2,
          tokenVersion: 1,
          accessToken: 'access-token-2',
        },
      }),
    );
    expect(api.registerDevice).toHaveBeenCalledTimes(2);
  });
});

describe('선택 변경', () => {
  it('OFF 저장 뒤 대기 중인 자동 동기화는 새 선택을 한 번 읽고 토큰을 조회하지 않는다', async () => {
    let enabled = true;
    storage.getSelection.mockImplementation(() => Promise.resolve({ enabled }));
    storage.setSelection.mockImplementation((_project, _installation, nextSelection) => {
      enabled = nextSelection.enabled;
      return Promise.resolve();
    });
    const getToken = vi.fn<() => Promise<string>>();
    const operation = input({ getToken });

    await Promise.all([registration.setEnabled(operation, false), registration.sync(operation)]);

    expect(storage.getSelection).toHaveBeenCalledTimes(2);
    expect(getToken).not.toHaveBeenCalled();
    expect(api.registerDevice).not.toHaveBeenCalled();
    expect(api.removeDevice).toHaveBeenCalledTimes(2);
  });

  it('서버 DELETE 성공 뒤 OFF 선택을 저장한다', async () => {
    await expect(registration.setEnabled(input(), false)).resolves.toEqual({
      ok: true,
      enabled: false,
    });

    expect(api.removeDevice).toHaveBeenCalledWith({
      sessionId: 'session-1',
      userId: 1,
      tokenVersion: 1,
      accessToken: 'access-token-1',
      installationId: 'fid-1',
    });
    expect(storage.setSelection).toHaveBeenCalledWith('yapp-plus', 'fid-1', { enabled: false });
  });

  it('서버 실패 때는 새 선택을 저장하지 않는다', async () => {
    api.removeDevice.mockResolvedValue({ ok: false, code: 'NETWORK' });

    await expect(registration.setEnabled(input(), false)).resolves.toEqual({
      ok: false,
      code: 'NETWORK',
    });
    expect(storage.setSelection).not.toHaveBeenCalled();
  });

  it('저장 실패면 이전 ON 상태로 서버를 다시 동기화한다', async () => {
    storage.setSelection.mockRejectedValueOnce(new Error('keychain unavailable'));

    await expect(registration.setEnabled(input(), false)).resolves.toEqual({
      ok: false,
      code: 'STORAGE',
    });
    expect(api.removeDevice).toHaveBeenCalledOnce();
    expect(api.registerDevice).toHaveBeenCalledWith({
      sessionId: 'session-1',
      userId: 1,
      tokenVersion: 1,
      accessToken: 'access-token-1',
      installationId: 'fid-1',
      registrationToken: 'fcm-token-1',
    });
  });

  it('권한 요청 예외 뒤에도 대기 중인 OFF 변경을 처리한다', async () => {
    const permission = Promise.withResolvers<'allowed'>();
    const started = Promise.withResolvers<void>();
    const operation = input({
      getPermission: () => Promise.resolve('undetermined'),
      requestPermission: () => {
        started.resolve();
        return permission.promise;
      },
    });

    const requesting = registration.requestPermission(operation);
    await started.promise;

    const disabling = registration.setEnabled(operation, false);
    expect(api.removeDevice).not.toHaveBeenCalled();
    permission.reject(new Error('permission unavailable'));

    await expect(requesting).rejects.toThrow('permission unavailable');
    await expect(disabling).resolves.toEqual({ ok: true, enabled: false });
    expect(storage.setSelection).toHaveBeenCalledWith('yapp-plus', 'fid-1', { enabled: false });
  });

  it('ON 응답 유실은 마지막 OFF 선택으로 복구하고 원래 오류를 반환한다', async () => {
    storage.getSelection.mockResolvedValue({ enabled: false });
    api.registerDevice.mockResolvedValueOnce({ ok: false, code: 'NETWORK' });

    await expect(registration.setEnabled(input(), true)).resolves.toEqual({
      ok: false,
      code: 'NETWORK',
    });
    expect(api.removeDevice).toHaveBeenCalledOnce();
    expect(storage.setSelection).not.toHaveBeenCalled();
  });

  it('복구도 실패하면 반복하지 않고 다음 동기화에서 같은 토큰을 다시 등록한다', async () => {
    await registration.sync(input());
    api.removeDevice.mockResolvedValueOnce({ ok: false, code: 'NETWORK' });
    api.registerDevice.mockRejectedValueOnce(new Error('offline'));

    await expect(registration.setEnabled(input(), false)).resolves.toEqual({
      ok: false,
      code: 'NETWORK',
    });
    expect(api.registerDevice).toHaveBeenCalledTimes(2);
    expect(api.removeDevice).toHaveBeenCalledOnce();

    await registration.sync(input());
    expect(api.registerDevice).toHaveBeenCalledTimes(3);
  });

  it('서버 예외도 저장된 선택으로 한 번 복구하고 원래 예외를 유지한다', async () => {
    storage.getSelection.mockResolvedValue({ enabled: false });
    api.registerDevice.mockRejectedValueOnce(new Error('request timeout'));

    await expect(registration.setEnabled(input(), true)).rejects.toThrow('request timeout');
    expect(api.removeDevice).toHaveBeenCalledOnce();
    expect(storage.setSelection).not.toHaveBeenCalled();
  });

  it('변경 중 세션이 끝나면 이전 계정으로 복구 요청을 보내지 않는다', async () => {
    let current = true;
    api.registerDevice.mockImplementationOnce(() => {
      current = false;
      return Promise.resolve({ ok: false, code: 'NETWORK' });
    });

    await expect(
      registration.setEnabled(input({ isSessionCurrent: () => current }), true),
    ).resolves.toEqual({ ok: false, code: 'CANCELLED' });
    expect(api.removeDevice).not.toHaveBeenCalled();
    expect(storage.getSelection).toHaveBeenCalledOnce();
  });

  it('동시 변경은 앞선 서버 응답이 끝난 뒤 직렬로 보낸다', async () => {
    const removing =
      Promise.withResolvers<Awaited<ReturnType<NotificationRegistrationApi['removeDevice']>>>();
    api.removeDevice.mockReturnValueOnce(removing.promise);

    const off = registration.setEnabled(input(), false);
    const on = registration.setEnabled(input(), true);
    expect(api.registerDevice).not.toHaveBeenCalled();
    removing.resolve({ ok: true });

    await off;
    await on;
    expect(api.removeDevice).toHaveBeenCalledOnce();
    expect(api.registerDevice).toHaveBeenCalledOnce();
  });
});
