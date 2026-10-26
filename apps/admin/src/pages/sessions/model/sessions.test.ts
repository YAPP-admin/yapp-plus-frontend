import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSessionInputSchema } from './session';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('DEV', true);
  vi.stubEnv('SSR', false);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('브라우저 예시 세션 서비스 경계', () => {
  it.each(['server', 'no-window'])('%s에서는 모든 작업을 차단한다', async (environment) => {
    if (environment === 'server') {
      vi.stubEnv('SSR', true);
    } else {
      vi.stubGlobal('window', undefined);
    }

    const service = await import('./sessions');
    const input = createSessionInputSchema.parse({
      name: '세션',
      location: {
        roadAddress: '서울특별시 중구 세종대로 110',
        detailAddress: '예시 교육장',
        latitude: 37.5665,
        longitude: 126.978,
      },
      date: '2026-11-01',
      startTime: '14:00',
      endTime: '17:00',
      type: 'offline',
    });

    await expect(service.listSessions()).rejects.toThrow('세션 관리 기능을 준비 중입니다.');
    await expect(service.createSession(input)).rejects.toThrow('세션 관리 기능을 준비 중입니다.');
    await expect(service.updateSession('missing', input)).rejects.toThrow(
      '세션 관리 기능을 준비 중입니다.',
    );
    await expect(service.deleteSession('missing')).rejects.toThrow(
      '세션 관리 기능을 준비 중입니다.',
    );
  });

  it.each([true, false])(
    'DEV=%s에서 예시 데이터를 제공하고 모듈 재시작 시 초기화한다',
    async (dev) => {
      vi.stubEnv('DEV', dev);
      const service = await import('./sessions');
      const before = await service.listSessions();
      const input = createSessionInputSchema.parse({
        name: '세션',
        location: {
          roadAddress: '서울특별시 중구 세종대로 110',
          detailAddress: '예시 교육장',
          latitude: 37.5665,
          longitude: 126.978,
        },
        date: '2026-11-01',
        startTime: '14:00',
        endTime: '17:00',
        type: 'offline',
      });

      const created = await service.createSession(input);
      const sameService = await import('./sessions');

      expect(await sameService.listSessions()).toContainEqual(created);

      const updated = await sameService.updateSession(created.id, { ...input, name: '수정 세션' });
      expect(updated).toEqual({ ...created, name: '수정 세션' });
      expect(await service.listSessions()).toContainEqual(updated);
      await expect(service.updateSession('missing', input)).rejects.toThrow(
        '수정할 세션을 찾을 수 없습니다.',
      );
      await expect(service.updateSession(created.id, { ...input, name: '' })).rejects.toThrow(
        '세션명을 입력하세요.',
      );
      expect(await service.listSessions()).toContainEqual(updated);

      await sameService.deleteSession(created.id);

      expect(await service.listSessions()).toEqual(before);

      await service.createSession(input);
      vi.resetModules();
      const reloadedService = await import('./sessions');

      expect(await reloadedService.listSessions()).toEqual(before);
    },
  );
});
