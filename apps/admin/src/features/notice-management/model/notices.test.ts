/** 개발 브라우저 가드·오류 분류·모듈 수명을 서비스 진입점에서 검증한다. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { noticeContentSchema } from './notice';

const input = noticeContentSchema.parse({
  category: 'session',
  audience: 'all',
  title: '새 공지',
  bodyDocument: {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }],
  },
});
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('DEV', true);
  vi.stubEnv('SSR', false);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('공지 서비스', () => {
  it.each(['production', 'server', 'no-window'])(
    '%s에서는 모든 호출과 저장소 직접 접근을 차단한다',
    async (environment) => {
      if (environment === 'production') {
        vi.stubEnv('DEV', false);
      } else if (environment === 'server') {
        vi.stubEnv('SSR', true);
      } else {
        vi.stubGlobal('window', undefined);
      }
      const service = await import('./notices');
      for (const call of [
        () => service.listNotices(),
        () => service.listNoticeMembers(),
        () => service.getNotice('x'),
        () => service.createNotice(input),
        () => service.updateNotice('x', input),
        () => service.deleteNotice('x'),
      ]) {
        await expect(call()).rejects.toMatchObject({ code: 'unavailable' });
      }
      const { getBrowserNoticeStore } = await import('./notices.mock');
      expect(getBrowserNoticeStore).toThrow('공지 관리 기능을 준비 중입니다.');
    },
  );
  it('같은 모듈은 상태를 공유하고 다시 로드하면 예시로 초기화한다', async () => {
    const service = await import('./notices');
    const before = await service.listNotices();
    const created = await service.createNotice(input);
    expect(await (await import('./notices')).getNotice(created.id)).toEqual(created);
    expect(await service.listNoticeMembers()).toHaveLength(4);
    vi.resetModules();
    expect(await (await import('./notices')).listNotices()).toEqual(before);
  });
  it('없는 공지 조회와 변경 오류·입력 오류를 구별하고 재시도할 수 있다', async () => {
    const service = await import('./notices');
    expect(await service.getNotice('missing')).toBeNull();
    await expect(service.updateNotice('missing', input)).rejects.toMatchObject({
      code: 'not-found',
    });
    await expect(service.deleteNotice('missing')).rejects.toMatchObject({ code: 'not-found' });
    await expect(service.createNotice({ ...input, title: '' })).rejects.toMatchObject({
      code: 'validation',
    });
    const created = await service.createNotice(input);
    expect((await service.updateNotice(created.id, { ...input, title: '수정' })).title).toBe(
      '수정',
    );
    await service.deleteNotice(created.id);
    expect(await service.getNotice(created.id)).toBeNull();
  });
  it('조회·생성·수정·삭제 실패를 unknown으로 통일하고 원본을 유지한다', async () => {
    const service = await import('./notices');
    const { getBrowserNoticeStore } = await import('./notices.mock');
    const store = getBrowserNoticeStore();
    const before = store.listNotices();
    for (const method of ['listNotices', 'createNotice', 'updateNotice', 'deleteNotice'] as const) {
      const spy = vi.spyOn(store, method).mockImplementation(() => {
        throw new Error('예시 실패');
      });
      const calls = {
        listNotices: () => service.listNotices(),
        createNotice: () => service.createNotice(input),
        updateNotice: () => service.updateNotice('demo-session', input),
        deleteNotice: () => service.deleteNotice('demo-session'),
      };
      await expect(calls[method]()).rejects.toMatchObject({ code: 'unknown' });
      spy.mockRestore();
      expect(store.listNotices()).toEqual(before);
    }
  });
});
