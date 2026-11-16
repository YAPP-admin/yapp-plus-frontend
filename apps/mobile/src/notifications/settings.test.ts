/** 실제 등록 큐를 연결해 알림 설정 RPC의 저장·권한·로그인 수명 경계를 검증합니다. */
import { expect, it, vi } from 'vitest';
import type { NotificationPermission } from '@yapp-plus/app-bridge';
import { NotificationRegistration, type NotificationRegistrationApi } from './registration';
import { createNotificationSettingsActions, type NotificationSettingsContext } from './settings';

const setup = () => {
  const state: { enabled: boolean; permission: NotificationPermission; current: boolean } = {
    enabled: false,
    permission: 'denied',
    current: true,
  };
  const storage = {
    getSelection: vi
      .fn<() => Promise<{ enabled: boolean }>>()
      .mockImplementation(() => Promise.resolve({ enabled: state.enabled })),
    setSelection: vi
      .fn<(project: string, fid: string, selection: { enabled: boolean }) => Promise<void>>()
      .mockImplementation((_project, _fid, selection) => {
        state.enabled = selection.enabled;
        return Promise.resolve();
      }),
  };
  const api: NotificationRegistrationApi = {
    registerDevice: vi
      .fn<NotificationRegistrationApi['registerDevice']>()
      .mockResolvedValue({ ok: true }),
    removeDevice: vi
      .fn<NotificationRegistrationApi['removeDevice']>()
      .mockResolvedValue({ ok: true }),
  };
  const readPermission = vi
    .fn<() => Promise<NotificationPermission>>()
    .mockImplementation(() => Promise.resolve(state.permission));
  const context: NotificationSettingsContext = {
    readPermission,
    input: {
      firebaseProjectId: 'project',
      installationId: 'installation',
      session: { userId: 7, sessionId: 'session', tokenVersion: 1, accessToken: 'fixture' },
      getToken: () => Promise.resolve('fixture-fcm'),
      getPermission: () => {
        if (state.permission === 'notDetermined') {
          return Promise.resolve('undetermined');
        }
        return Promise.resolve(state.permission === 'denied' ? 'blocked' : 'allowed');
      },
      requestPermission: vi
        .fn<NotificationSettingsContext['input']['requestPermission']>()
        .mockImplementation(() => {
          state.permission = 'authorized';
          return Promise.resolve('allowed');
        }),
      isSessionCurrent: () => state.current,
    },
  };
  const registration = new NotificationRegistration(storage, api);
  const getContext = vi.fn<() => Promise<NotificationSettingsContext>>().mockResolvedValue(context);
  const actions = createNotificationSettingsActions(getContext, registration, storage);
  return { state, storage, api, context, getContext, actions, registration };
};

it('조회는 저장된 ON과 OS 거부를 구분하고 권한 팝업·서버 요청을 시작하지 않는다', async () => {
  const { state, actions, context, api } = setup();
  state.enabled = true;
  expect(await actions.getNotificationSettings()).toEqual({
    status: 'SUCCESS',
    enabled: true,
    permission: 'denied',
  });
  expect(context.input.requestPermission).not.toHaveBeenCalled();
  expect(api.registerDevice).not.toHaveBeenCalled();
  expect(api.removeDevice).not.toHaveBeenCalled();
});
it('권한 전용 요청은 수신 선택과 서버 등록을 변경하지 않는다', async () => {
  const { state, actions, storage, api } = setup();
  state.permission = 'notDetermined';
  expect(await actions.requestNotificationPermission()).toEqual({
    status: 'SUCCESS',
    permission: 'authorized',
  });
  expect(state.enabled).toBe(false);
  expect(storage.setSelection).not.toHaveBeenCalled();
  expect(api.registerDevice).not.toHaveBeenCalled();
});
it('수동 ON에서 권한이 거부되면 이전 선택을 저장하지 않고 유지한다', async () => {
  const { actions, storage, state } = setup();
  expect(await actions.setNotificationEnabled({ enabled: true })).toMatchObject({
    code: 'PERMISSION_REQUIRED',
  });
  expect(storage.setSelection).not.toHaveBeenCalled();
  expect(state.enabled).toBe(false);
});
it('서버 등록이 성공한 뒤 ON을 저장하고 상세 권한을 반환한다', async () => {
  const { actions, state, api } = setup();
  state.permission = 'provisional';
  expect(await actions.setNotificationEnabled({ enabled: true })).toEqual({
    status: 'SUCCESS',
    enabled: true,
    permission: 'provisional',
  });
  expect(state.enabled).toBe(true);
  expect(api.registerDevice).toHaveBeenCalledOnce();
});
it('서버 충돌은 이전 선택을 유지한다', async () => {
  const { actions, state, api, storage } = setup();
  state.permission = 'authorized';
  vi.mocked(api.registerDevice).mockResolvedValue({ ok: false, code: 'CONFLICT' });
  expect(await actions.setNotificationEnabled({ enabled: true })).toMatchObject({
    code: 'CONFLICT',
  });
  expect(storage.setSelection).not.toHaveBeenCalled();
});
it('조회 저장 실패와 잘못된 입력을 구분한다', async () => {
  const { actions, getContext, storage } = setup();
  expect(await actions.setNotificationEnabled({ enabled: 'true' })).toMatchObject({
    code: 'INVALID_INPUT',
  });
  expect(getContext).not.toHaveBeenCalled();
  storage.getSelection.mockRejectedValue(new Error('storage'));
  expect(await actions.getNotificationSettings()).toMatchObject({ code: 'STORAGE' });
});
it('늦은 서버 성공을 새 로그인 수명에 저장하지 않는다', async () => {
  const { actions, state, api, storage } = setup();
  state.permission = 'authorized';
  const pending = Promise.withResolvers<{ ok: true }>();
  vi.mocked(api.registerDevice).mockReturnValue(pending.promise);
  const changing = actions.setNotificationEnabled({ enabled: true });
  await vi.waitFor(() => expect(api.registerDevice).toHaveBeenCalledOnce());
  state.current = false;
  pending.resolve({ ok: true });
  expect(await changing).toMatchObject({ code: 'BUSY' });
  expect(storage.setSelection).not.toHaveBeenCalled();
});
it('자동 동기화와 권한 요청이 겹쳐도 하나의 권한 요청을 공유한다', async () => {
  const { actions, state, context, registration } = setup();
  state.enabled = true;
  state.permission = 'notDetermined';
  const pending = Promise.withResolvers<'allowed'>();
  vi.mocked(context.input.requestPermission).mockImplementation(() => pending.promise);
  const syncing = registration.sync(context.input);
  const asking = actions.requestNotificationPermission();
  await vi.waitFor(() => expect(context.input.requestPermission).toHaveBeenCalledOnce());
  state.permission = 'authorized';
  pending.resolve('allowed');
  await Promise.all([syncing, asking]);
  expect(context.input.requestPermission).toHaveBeenCalledOnce();
});
