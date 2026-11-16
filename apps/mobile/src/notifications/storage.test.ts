/** 설치별 알림 선택 저장의 기본값·손상·저장소 실패 정책을 검증합니다. */

import * as SecureStore from 'expo-secure-store';
import { beforeEach, expect, it, vi } from 'vitest';

import { getNotificationSelection, setNotificationSelection } from './storage';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn<typeof SecureStore.getItemAsync>(),
  setItemAsync: vi.fn<typeof SecureStore.setItemAsync>(),
  deleteItemAsync: vi.fn<typeof SecureStore.deleteItemAsync>(),
}));

const projectId = 'yapp-plus';
const installationId = 'firebase-installation-id';
const key = 'org.yapp.yappplus.notifications.selection.yapp-plus.firebase-installation-id';
let values: Map<string, string>;

beforeEach(() => {
  vi.resetAllMocks();
  values = new Map();
  vi.mocked(SecureStore.getItemAsync).mockImplementation((name) =>
    Promise.resolve(values.get(name) ?? null),
  );
  vi.mocked(SecureStore.setItemAsync).mockImplementation((name, value) => {
    values.set(name, value);
    return Promise.resolve();
  });
  vi.mocked(SecureStore.deleteItemAsync).mockImplementation((name) => {
    values.delete(name);
    return Promise.resolve();
  });
});

it('값이 없으면 설치별 기본 ON을 반환한다', async () => {
  await expect(getNotificationSelection(projectId, installationId)).resolves.toEqual({
    enabled: true,
  });
  expect(SecureStore.getItemAsync).toHaveBeenCalledWith(key);
});

it('프로젝트와 FID마다 선택을 분리해 저장한다', async () => {
  await setNotificationSelection(projectId, installationId, { enabled: false });

  await expect(getNotificationSelection(projectId, installationId)).resolves.toEqual({
    enabled: false,
  });
  await expect(getNotificationSelection(projectId, 'other-fid')).resolves.toEqual({
    enabled: true,
  });
});

it.each(['not-json', JSON.stringify({ enabled: true }), JSON.stringify(null)])(
  '손상된 저장값은 이후 조회에서도 OFF를 유지한다',
  async (value) => {
    values.set(key, value);

    await expect(getNotificationSelection(projectId, installationId)).resolves.toEqual({
      enabled: false,
    });
    await expect(getNotificationSelection(projectId, installationId)).resolves.toEqual({
      enabled: false,
    });
    expect(values.get(key)).toBe('false');
  },
);

it('읽기와 쓰기 실패를 기본값으로 숨기지 않는다', async () => {
  vi.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error('keychain unavailable'));
  await expect(getNotificationSelection(projectId, installationId)).rejects.toThrow(
    'keychain unavailable',
  );

  vi.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('keychain unavailable'));
  await expect(
    setNotificationSelection(projectId, installationId, { enabled: true }),
  ).rejects.toThrow('keychain unavailable');
});
