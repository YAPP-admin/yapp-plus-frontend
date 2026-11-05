/** SessionManager의 refresh 경쟁 조건과 로컬 자격 정리 규칙을 검증합니다. */

import type { AuthSession } from '@yapp-plus/app-bridge';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionManager, type SessionCredentials } from './session';

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

const signedInSession = async (manager: SessionManager): Promise<AuthSession> => {
  const result = await manager.establish(credentials(1));
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
    let resolveRenew: ((value: SessionCredentials) => void) | undefined;
    const renew = vi.fn<() => Promise<SessionCredentials>>(
      () =>
        new Promise<SessionCredentials>((resolve) => {
          resolveRenew = resolve;
        }),
    );

    const first = manager.refresh(session, renew);
    const second = manager.refresh(session, renew);

    expect(renew).toHaveBeenCalledTimes(1);
    resolveRenew?.(credentials(2));

    await expect(first).resolves.toMatchObject({ status: 'SIGNED_IN' });
    await expect(second).resolves.toMatchObject({ status: 'SIGNED_IN' });
  });

  it('갱신 실패 뒤에는 다음 요청이 새 refresh를 시작할 수 있다', async () => {
    const manager = new SessionManager();
    const session = await signedInSession(manager);
    const renew = vi
      .fn<() => Promise<SessionCredentials>>()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(credentials(2));

    await expect(manager.refresh(session, renew)).resolves.toMatchObject({ status: 'UNAVAILABLE' });
    await expect(manager.refresh(session, renew)).resolves.toMatchObject({ status: 'SIGNED_IN' });

    expect(renew).toHaveBeenCalledTimes(2);
  });

  it('이미 새 token이 있으면 오래된 401으로 다시 갱신하지 않는다', async () => {
    const manager = new SessionManager();
    const oldSession = await signedInSession(manager);
    const renew = vi.fn<() => Promise<SessionCredentials>>().mockResolvedValue(credentials(2));

    const refreshed = await manager.refresh(oldSession, renew);
    const lateResult = await manager.refresh(oldSession, renew);

    expect(refreshed).toMatchObject({ status: 'SIGNED_IN', session: { tokenVersion: 2 } });
    expect(lateResult).toMatchObject({ status: 'SIGNED_IN', session: { tokenVersion: 2 } });
    expect(renew).toHaveBeenCalledTimes(1);
  });

  it('로그아웃 중 늦게 완료된 refresh가 세션을 되살리지 못하게 한다', async () => {
    const manager = new SessionManager();
    const session = await signedInSession(manager);
    let resolveRenew: ((value: SessionCredentials) => void) | undefined;
    const renew = vi.fn<() => Promise<SessionCredentials>>(
      () =>
        new Promise<SessionCredentials>((resolve) => {
          resolveRenew = resolve;
        }),
    );

    const refreshing = manager.refresh(session, renew);
    await manager.clear();
    resolveRenew?.(credentials(2));

    await expect(refreshing).resolves.toEqual({ status: 'SIGNED_OUT' });
    expect(storage.setRefreshToken).toHaveBeenCalledTimes(1);
  });
});
