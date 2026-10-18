/** 세션 서비스의 실행 환경 제한과 입력 검증, 저장소 연결을 검증합니다. */
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

describe('개발용 세션 서비스 경계', () => {
  it.each(['production', 'server', 'no-window'])(
    '%s에서는 모든 작업을 차단한다',
    async (environment) => {
      if (environment === 'production') {
        vi.stubEnv('DEV', false);
      } else if (environment === 'server') {
        vi.stubEnv('SSR', true);
      } else {
        vi.stubGlobal('window', undefined);
      }

      const service = await import('./sessions');
      const input = createSessionInputSchema.parse({
        name: '세션',
        location: '교육장',
        date: '2026-11-01',
        startTime: '14:00',
        endTime: '17:00',
        type: 'regular',
      });

      await expect(service.listSessions()).rejects.toThrow('세션 관리 기능을 준비 중입니다.');
      await expect(service.createSession(input)).rejects.toThrow('세션 관리 기능을 준비 중입니다.');
      await expect(service.deleteSession('missing')).rejects.toThrow(
        '세션 관리 기능을 준비 중입니다.',
      );
    },
  );

  it('같은 모듈에서는 변경을 유지하고 모듈 재시작 시 초기화한다', async () => {
    const service = await import('./sessions');
    const before = await service.listSessions();
    const input = createSessionInputSchema.parse({
      name: '세션',
      location: '교육장',
      date: '2026-11-01',
      startTime: '14:00',
      endTime: '17:00',
      type: 'regular',
    });

    const created = await service.createSession(input);
    const sameService = await import('./sessions');

    expect(await sameService.listSessions()).toContainEqual(created);

    await sameService.deleteSession(created.id);

    expect(await service.listSessions()).toEqual(before);

    await service.createSession(input);
    vi.resetModules();
    const reloadedService = await import('./sessions');

    expect(await reloadedService.listSessions()).toEqual(before);
  });
});
