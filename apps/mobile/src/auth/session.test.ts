/** SessionManager의 refresh 경쟁 조건과 로컬 자격 정리 규칙을 검증합니다. */

import type { AuthSession } from '@yapp-plus/app-bridge';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionManager, type SessionCredentials, type RenewalResult } from './session';

const storage = vi.hoisted(() => ({
  clearSession: vi.fn<() => Promise<void>>(),
  getRefreshToken: vi.fn<() => Promise<string | null>>(),
  setRefreshToken: vi.fn<(token: string) => Promise<void>>(),
}));

vi.mock('./storage', () => ({ authStorage: storage }));

const credentials = (version: number): SessionCredentials => ({
  accessToken: `access-${version}`,
  refreshToken: `refresh-${version}`,
  expiresAt: Date.now() + 3_600_000,
  userId: 1,
});

const renewed = (version: number): RenewalResult => ({
  kind: 'success',
  credentials: credentials(version),
});

const signedInSession = async (manager: SessionManager): Promise<AuthSession> => {
  const result = await manager.establish(credentials(1), manager.captureGeneration());
  if (result.status !== 'SIGNED_IN') {
    throw new Error('테스트 세션을 시작하지 못했습니다.');
  }

  return result.session;
};

describe('SessionManager', () => {
  beforeEach(() => {
    storage.clearSession.mockReset().mockResolvedValue(undefined);
    storage.getRefreshToken.mockReset().mockResolvedValue(null);
    storage.setRefreshToken.mockReset().mockResolvedValue(undefined);
  });

  it('동시에 들어온 refresh 요청을 하나의 네트워크 호출로 합친다', async () => {
    const manager = new SessionManager();
    const session = await signedInSession(manager);
    let resolveRenew: ((value: RenewalResult) => void) | undefined;
    const renew = vi.fn<() => Promise<RenewalResult>>(
      () =>
        new Promise<RenewalResult>((resolve) => {
          resolveRenew = resolve;
        }),
    );

    const first = manager.refresh(session, renew);
    const second = manager.refresh(session, renew);

    expect(renew).toHaveBeenCalledTimes(1);
    resolveRenew?.(renewed(2));

    await expect(first).resolves.toMatchObject({ status: 'SIGNED_IN' });
    await expect(second).resolves.toMatchObject({ status: 'SIGNED_IN' });
  });

  it('갱신 실패 뒤에는 다음 요청이 새 refresh를 시작할 수 있다', async () => {
    const manager = new SessionManager();
    const session = await signedInSession(manager);
    const renew = vi
      .fn<() => Promise<RenewalResult>>()
      .mockResolvedValueOnce({ kind: 'temporary-failure', reason: 'NETWORK' })
      .mockResolvedValueOnce(renewed(2));

    await expect(manager.refresh(session, renew)).resolves.toMatchObject({ status: 'UNAVAILABLE' });
    await expect(manager.refresh(session, renew)).resolves.toMatchObject({ status: 'SIGNED_IN' });

    expect(renew).toHaveBeenCalledTimes(2);
  });

  it('이미 새 token이 있으면 오래된 401으로 다시 갱신하지 않는다', async () => {
    const manager = new SessionManager();
    const oldSession = await signedInSession(manager);
    const renew = vi.fn<() => Promise<RenewalResult>>().mockResolvedValue(renewed(2));

    const refreshed = await manager.refresh(oldSession, renew);
    const lateResult = await manager.refresh(oldSession, renew);

    expect(refreshed).toMatchObject({ status: 'SIGNED_IN', session: { tokenVersion: 2 } });
    expect(lateResult).toMatchObject({ status: 'SIGNED_IN', session: { tokenVersion: 2 } });
    expect(renew).toHaveBeenCalledTimes(1);
  });

  it('로그아웃 중 늦게 완료된 refresh가 세션을 되살리지 못하게 한다', async () => {
    const manager = new SessionManager();
    const session = await signedInSession(manager);
    let resolveRenew: ((value: RenewalResult) => void) | undefined;
    const renew = vi.fn<() => Promise<RenewalResult>>(
      () =>
        new Promise<RenewalResult>((resolve) => {
          resolveRenew = resolve;
        }),
    );

    const refreshing = manager.refresh(session, renew);
    await manager.clear();
    resolveRenew?.(renewed(2));

    await expect(refreshing).resolves.toEqual({ status: 'CANCELLED' });
    expect(storage.setRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('로그아웃이 시작된 뒤 완료된 저장소 읽기를 복구에 사용하지 않는다', async () => {
    const manager = new SessionManager();
    const read = Promise.withResolvers<string | null>();
    const started = Promise.withResolvers<void>();
    storage.getRefreshToken.mockImplementation(() => {
      started.resolve();
      return read.promise;
    });
    const renew = vi.fn<() => Promise<RenewalResult>>().mockResolvedValue(renewed(2));
    const restoring = manager.get(renew);
    await started.promise;
    const clearing = manager.clear();
    read.resolve('old-refresh');
    await Promise.all([restoring, clearing]);
    expect(renew).not.toHaveBeenCalled();
    expect(manager.refreshToken).toBeUndefined();
    await expect(manager.get(renew)).resolves.toEqual({ status: 'SIGNED_OUT' });
  });

  it.each(['login', 'refresh'])('진행 중인 %s 저장 뒤에 logout 삭제를 실행한다', async (kind) => {
    const manager = new SessionManager();
    const session = await signedInSession(manager);
    const write = Promise.withResolvers<void>();
    const started = Promise.withResolvers<void>();
    let persisted: string | null = 'refresh-1';
    storage.setRefreshToken.mockImplementation(async (token) => {
      started.resolve();
      await write.promise;
      persisted = token;
    });
    storage.clearSession.mockImplementation(() => {
      persisted = null;
      return Promise.resolve();
    });
    const saving =
      kind === 'login'
        ? manager.establish(credentials(2), manager.captureGeneration())
        : manager.refresh(session, () => Promise.resolve(renewed(2)));
    await started.promise;
    const clearing = manager.clear();
    write.resolve();
    const [result] = await Promise.all([saving, clearing]);
    expect(result.status).not.toBe('SIGNED_IN');
    expect(persisted).toBeNull();
    expect(manager.accessToken).toBeUndefined();
  });

  it('삭제 실패 후 같은 프로세스에서 이전 자격을 다시 읽지 않는다', async () => {
    const manager = new SessionManager();
    await signedInSession(manager);
    storage.clearSession.mockRejectedValueOnce(new Error('storage'));
    storage.getRefreshToken.mockResolvedValue('refresh-1');
    const renew = vi.fn<() => Promise<RenewalResult>>().mockResolvedValue(renewed(2));
    await expect(manager.clear()).resolves.toMatchObject({ code: 'STORAGE' });
    await expect(manager.get(renew)).resolves.toMatchObject({ code: 'STORAGE' });
    expect(storage.getRefreshToken).not.toHaveBeenCalled();
    expect(renew).not.toHaveBeenCalled();
    await expect(
      manager.establish(credentials(3), manager.captureGeneration()),
    ).resolves.toMatchObject({ status: 'SIGNED_IN' });
  });

  it('이전 갱신의 finally가 새 세션의 진행 갱신을 해제하지 않는다', async () => {
    const manager = new SessionManager();
    const first = await signedInSession(manager);
    const old = Promise.withResolvers<RenewalResult>();
    const oldRequest = manager.refresh(first, () => old.promise);
    await manager.clear();
    const next = await signedInSession(manager);
    const pending = Promise.withResolvers<RenewalResult>();
    const renew = vi.fn<() => Promise<RenewalResult>>(() => pending.promise);
    const newRequest = manager.refresh(next, renew);
    expect(renew).toHaveBeenCalledTimes(1);
    old.resolve(renewed(2));
    await oldRequest;
    const duplicate = manager.refresh(next, renew);
    pending.resolve(renewed(3));
    const results = await Promise.all([newRequest, duplicate]);
    expect(results).toEqual([
      expect.objectContaining({
        status: 'SIGNED_IN',
        session: expect.objectContaining({ accessToken: 'access-3' }),
      }),
      expect.objectContaining({
        status: 'SIGNED_IN',
        session: expect.objectContaining({ accessToken: 'access-3' }),
      }),
    ]);
    expect(renew).toHaveBeenCalledTimes(1);
    expect(manager.refreshToken).toBe('refresh-3');
  });

  it('동시 복구는 저장소 읽기와 갱신을 공유한다', async () => {
    const manager = new SessionManager();
    storage.getRefreshToken.mockResolvedValue('refresh-1');
    const renew = vi.fn<() => Promise<RenewalResult>>().mockResolvedValue(renewed(2));
    const results = await Promise.all([manager.get(renew), manager.get(renew)]);
    expect(results[0]).toEqual(results[1]);
    expect(storage.getRefreshToken).toHaveBeenCalledTimes(1);
    expect(renew).toHaveBeenCalledTimes(1);
  });

  it('로그아웃 전 세대를 전달한 로그인 결과는 저장하지 않는다', async () => {
    const manager = new SessionManager();
    const generation = manager.captureGeneration();
    await manager.clear();
    await expect(manager.establish(credentials(1), generation)).resolves.toEqual({
      status: 'CANCELLED',
    });
    expect(storage.setRefreshToken).not.toHaveBeenCalled();
  });

  it('갱신 저장 실패를 네트워크 오류로 숨기지 않고 다음 저장을 허용한다', async () => {
    const manager = new SessionManager();
    const session = await signedInSession(manager);
    storage.setRefreshToken.mockRejectedValueOnce(new Error('storage'));
    const renew = vi.fn<() => Promise<RenewalResult>>().mockResolvedValue(renewed(2));
    await expect(manager.refresh(session, renew)).resolves.toMatchObject({ code: 'STORAGE' });
    expect(manager.refreshToken).toBe('refresh-1');
    await expect(manager.refresh(session, renew)).resolves.toMatchObject({ status: 'SIGNED_IN' });
  });
});
