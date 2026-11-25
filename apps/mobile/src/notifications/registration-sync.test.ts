/** 실제 등록 조율기를 연결해 인증·권한·앱 수명의 동기화 정책을 검증합니다. */
import type { AuthSession } from '@yapp-plus/app-bridge';
import { expect, it, vi } from 'vitest';
import {
  NotificationRegistration,
  type NotificationRegistrationApi,
  type NotificationPermission,
} from './registration';
import { startNotificationRegistrationSync } from './registration-sync';

const setup = (enabled = true, initialPermission: NotificationPermission = 'allowed') => {
  let session: AuthSession | undefined = {
    userId: 1,
    sessionId: 's1',
    tokenVersion: 1,
    accessToken: 'a1',
    expiresAt: Date.now() + 60_000,
  };
  let sessionListener: () => void = vi.fn<() => void>();
  let tokenListener: () => void = vi.fn<() => void>();
  let activeListener: () => void = vi.fn<() => void>();
  const unsubscribers = [vi.fn<() => void>(), vi.fn<() => void>(), vi.fn<() => void>()] as const;
  const storage = {
    getSelection: vi.fn<() => Promise<{ enabled: boolean }>>().mockResolvedValue({ enabled }),
    setSelection: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
  const api = {
    registerDevice: vi
      .fn<NotificationRegistrationApi['registerDevice']>()
      .mockResolvedValue({ ok: true }),
    removeDevice: vi
      .fn<NotificationRegistrationApi['removeDevice']>()
      .mockResolvedValue({ ok: true }),
  };
  const registration = new NotificationRegistration(storage, api);
  const sync = vi.fn<typeof registration.sync>((input) => registration.sync(input));
  const getPermission = vi
    .fn<() => Promise<NotificationPermission>>()
    .mockResolvedValue(initialPermission);
  const requestPermission = vi
    .fn<() => Promise<NotificationPermission>>()
    .mockResolvedValue('allowed');
  const getToken = vi.fn<() => Promise<string>>().mockResolvedValue('fcm1');
  const stop = startNotificationRegistrationSync({
    firebaseProjectId: 'project',
    getInstallationId: () => Promise.resolve('fid'),
    getToken,
    getPermission,
    requestPermission,
    getSession: () =>
      Promise.resolve(
        session
          ? { status: 'SIGNED_IN', session, reviewTransition: 'NONE' }
          : { status: 'SIGNED_OUT' },
      ),
    getSessionSnapshot: () => session,
    subscribeSession: (listener) => {
      sessionListener = listener;
      return unsubscribers[0];
    },
    subscribeToken: (listener) => {
      tokenListener = listener;
      return unsubscribers[1];
    },
    subscribeActive: (listener) => {
      activeListener = listener;
      return unsubscribers[2];
    },
    sync,
    clearRegistrationCache: () => registration.clearRegistrationCache(),
  });
  return {
    api,
    storage,
    sync,
    getPermission,
    requestPermission,
    getToken,
    stop,
    unsubscribers,
    token: () => tokenListener(),
    active: () => activeListener(),
    changeSession: (next: AuthSession | undefined) => {
      session = next;
      sessionListener();
    },
  };
};

it('최초 인증 후 미결정 권한만 요청하고 중복 이벤트에서는 같은 등록을 보내지 않는다', async () => {
  const runtime = setup(true, 'undetermined');
  runtime.getPermission.mockResolvedValue('allowed');
  // 첫 조회만 미결정으로 두어 권한 다이얼로그 완료를 재현합니다.
  runtime.getPermission.mockResolvedValueOnce('undetermined');
  await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledOnce());
  expect(runtime.storage.getSelection).toHaveBeenCalledOnce();
  runtime.active();
  runtime.token();
  await vi.waitFor(() => expect(runtime.sync).toHaveBeenCalledTimes(3));
  expect(runtime.requestPermission).toHaveBeenCalledOnce();
  expect(runtime.api.registerDevice).toHaveBeenCalledOnce();
  runtime.stop();
});

it('권한 요청 실패 후 같은 세션의 앱 복귀에서 미결정 권한을 다시 요청한다', async () => {
  const runtime = setup(true, 'undetermined');
  runtime.requestPermission.mockRejectedValueOnce(new Error('permission unavailable'));
  await vi.waitFor(() => expect(runtime.requestPermission).toHaveBeenCalledOnce());
  expect(runtime.api.registerDevice).not.toHaveBeenCalled();

  runtime.active();
  try {
    await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledOnce());
    expect(runtime.requestPermission).toHaveBeenCalledTimes(2);
    expect(runtime.api.removeDevice).not.toHaveBeenCalled();
  } finally {
    runtime.stop();
  }
});

it('동시 수명 이벤트는 조율기의 같은 권한 요청이 끝날 때까지 기다린다', async () => {
  const runtime = setup(true, 'undetermined');
  const permission = Promise.withResolvers<NotificationPermission>();
  runtime.requestPermission.mockReturnValueOnce(permission.promise);
  await vi.waitFor(() => expect(runtime.requestPermission).toHaveBeenCalledOnce());

  runtime.active();
  runtime.token();
  await vi.waitFor(() => expect(runtime.sync).toHaveBeenCalledTimes(3));
  expect(runtime.storage.getSelection).toHaveBeenCalledOnce();
  expect(runtime.getPermission).toHaveBeenCalledOnce();
  expect(runtime.api.registerDevice).not.toHaveBeenCalled();

  runtime.getPermission.mockResolvedValue('allowed');
  permission.resolve('allowed');
  await vi.waitFor(() => expect(runtime.getToken).toHaveBeenCalledTimes(3));
  expect(runtime.storage.getSelection).toHaveBeenCalledTimes(3);
  expect(runtime.requestPermission).toHaveBeenCalledOnce();
  expect(runtime.api.registerDevice).toHaveBeenCalledOnce();
  runtime.stop();
});

it.each([
  [false, 'undetermined'],
  [true, 'blocked'],
] as const)(
  '선택 %s·권한 %s이면 등록 해제만 하고 권한을 요청하지 않는다',
  async (enabled, permission) => {
    const runtime = setup(enabled, permission);
    await vi.waitFor(() => expect(runtime.api.removeDevice).toHaveBeenCalledOnce());
    expect(runtime.api.registerDevice).not.toHaveBeenCalled();
    expect(runtime.requestPermission).not.toHaveBeenCalled();
    expect(runtime.getToken).not.toHaveBeenCalled();
    runtime.stop();
  },
);

it('토큰 변경·권한 차단 후 복귀·재허용을 서버에 반영한다', async () => {
  const runtime = setup();
  await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledOnce());
  runtime.getToken.mockResolvedValue('fcm2');
  runtime.token();
  await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledTimes(2));
  runtime.getPermission.mockResolvedValue('blocked');
  runtime.active();
  await vi.waitFor(() => expect(runtime.api.removeDevice).toHaveBeenCalledOnce());
  runtime.getPermission.mockResolvedValue('allowed');
  runtime.active();
  await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledTimes(3));
  runtime.stop();
});

it('토큰 조회 중 계정이 바뀌면 이전 작업을 폐기하고 새 계정으로 등록한다', async () => {
  const runtime = setup();
  const token = Promise.withResolvers<string>();
  runtime.getToken.mockReturnValueOnce(token.promise);
  await vi.waitFor(() => expect(runtime.getToken).toHaveBeenCalledOnce());
  runtime.changeSession({
    userId: 2,
    sessionId: 's2',
    tokenVersion: 1,
    accessToken: 'a2',
    expiresAt: Date.now() + 60_000,
  });
  token.resolve('old-token');
  await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledOnce());
  expect(runtime.api.registerDevice).toHaveBeenCalledWith(expect.objectContaining({ userId: 2 }));
  runtime.stop();
});

it('실패는 다음 복귀에서 재시도하고 정리 뒤에는 늦은 작업을 등록하지 않는다', async () => {
  const runtime = setup();
  runtime.getToken.mockRejectedValueOnce(new Error('offline'));
  await vi.waitFor(() => expect(runtime.getToken).toHaveBeenCalledOnce());
  runtime.active();
  await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledOnce());
  const token = Promise.withResolvers<string>();
  runtime.getToken.mockReturnValueOnce(token.promise);
  runtime.token();
  await vi.waitFor(() => expect(runtime.getToken).toHaveBeenCalledTimes(3));
  runtime.stop();
  token.resolve('late');
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(runtime.api.registerDevice).toHaveBeenCalledOnce();
  for (const unsubscribe of runtime.unsubscribers) {
    expect(unsubscribe).toHaveBeenCalledOnce();
  }
});

it('세션 종료 시 캐시를 비워 같은 식별자가 다시 관찰돼도 서버 등록을 확인한다', async () => {
  const runtime = setup();
  await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledOnce());
  runtime.changeSession(undefined);
  runtime.changeSession({
    userId: 1,
    sessionId: 's1',
    tokenVersion: 1,
    accessToken: 'a1',
    expiresAt: Date.now() + 60_000,
  });
  await vi.waitFor(() => expect(runtime.api.registerDevice).toHaveBeenCalledTimes(2));
  runtime.stop();
});
