/** 실제 세션 관리자·저장소를 연결하고 SecureStore 경계의 부분 삭제 실패와 복구를 검증합니다. */

import { expect, it, vi } from 'vitest';

import { SessionManager, type RenewalResult, type RevocationResult } from './session';

vi.mock('expo-crypto', async () => {
  const { randomUUID } = await import('node:crypto');
  return { randomUUID };
});

it('서버 로그아웃 성공 뒤 로컬 삭제 실패는 자격을 복원하지 않고 삭제만 재시도한다', async () => {
  secureStore.setItemAsync.mockResolvedValue(undefined);
  secureStore.deleteItemAsync.mockResolvedValue(undefined);
  secureStore.getItemAsync.mockClear();
  const manager = new SessionManager();
  await expect(
    manager.establish(
      {
        accessToken: 'fixture-access',
        refreshToken: 'fixture-refresh',
        expiresAt: Date.now() + 3_600_000,
        userId: 1,
      },
      manager.captureGeneration(),
    ),
  ).resolves.toMatchObject({ status: 'SIGNED_IN' });
  secureStore.deleteItemAsync.mockRejectedValue(new Error('storage'));
  const revoke = vi
    .fn<(token: string) => Promise<RevocationResult>>()
    .mockResolvedValue({ ok: true });
  await expect(manager.signOut(revoke)).resolves.toMatchObject({
    status: 'ERROR',
    code: 'STORAGE',
  });
  expect(manager.snapshot).toBeUndefined();
  expect(manager.refreshToken).toBeUndefined();
  secureStore.deleteItemAsync.mockResolvedValue(undefined);
  const renew = vi.fn<() => Promise<RenewalResult>>();
  await expect(manager.get(renew)).resolves.toEqual({ status: 'SIGNED_OUT' });
  expect(renew).not.toHaveBeenCalled();
  expect(secureStore.getItemAsync).not.toHaveBeenCalled();
  expect(revoke).toHaveBeenCalledExactlyOnceWith('fixture-refresh');
});

const secureStore = vi.hoisted(() => ({
  getItemAsync: vi.fn<(key: string) => Promise<string | null>>(),
  setItemAsync: vi.fn<(key: string, value: string) => Promise<void>>(),
  deleteItemAsync: vi.fn<(key: string) => Promise<void>>(),
}));
vi.mock('expo-secure-store', () => secureStore);

it('갱신 자격 무효 후 legacy 키 삭제만 실패해도 같은 프로세스에서 정리를 완료한다', async () => {
  const sessionKey = 'org.yapp.yappplus.auth.session';
  const legacyKey = 'org.yapp.yappplus.auth.refresh-token';
  const values = new Map<string, string>();
  let failLegacyDelete = false;
  secureStore.getItemAsync.mockImplementation((key) => Promise.resolve(values.get(key) ?? null));
  secureStore.setItemAsync.mockImplementation((key, value) => {
    values.set(key, value);
    return Promise.resolve();
  });
  secureStore.deleteItemAsync.mockImplementation((key) => {
    if (failLegacyDelete && key === legacyKey) {
      return Promise.reject(new Error('storage'));
    }
    values.delete(key);
    return Promise.resolve();
  });
  const manager = new SessionManager();
  await manager.establish(
    {
      accessToken: 'fixture-access',
      refreshToken: 'fixture-refresh',
      expiresAt: Date.now() - 1,
      userId: 1,
    },
    manager.captureGeneration(),
  );
  values.set(legacyKey, 'fixture-legacy');
  failLegacyDelete = true;
  const renew = vi
    .fn<() => Promise<RenewalResult>>()
    .mockResolvedValue({ kind: 'invalid-session' });
  await expect(manager.get(renew)).resolves.toEqual({
    status: 'ERROR',
    code: 'STORAGE',
    retryable: true,
  });
  expect(values.has(sessionKey)).toBe(false);
  expect(values.has(legacyKey)).toBe(true);
  secureStore.deleteItemAsync.mockClear();
  failLegacyDelete = false;
  await expect(manager.get(renew)).resolves.toEqual({ status: 'SIGNED_OUT' });
  expect(secureStore.deleteItemAsync.mock.calls).toEqual([[sessionKey], [legacyKey]]);
  expect(values.size).toBe(0);
  expect(secureStore.getItemAsync).not.toHaveBeenCalled();
  expect(renew).toHaveBeenCalledTimes(1);
  expect(manager.accessToken).toBeUndefined();
  expect(manager.refreshToken).toBeUndefined();
});
