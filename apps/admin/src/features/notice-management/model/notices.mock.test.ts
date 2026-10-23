/** 모의 CRUD의 원자성·원본 격리·대상 변경을 실제 저장소 함수로 검증한다. */
import { z } from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { noticeContentSchema } from './notice';
import { createNoticeStore } from './notices.mock';

const input = noticeContentSchema.parse({
  category: 'session',
  audience: 'all',
  title: '새 공지',
  bodyDocument: {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }],
  },
});

describe('공지 모의 저장소', () => {
  it('세 종류의 공지와 합성 명단을 제공하고 최신순·동률 ID순으로 정렬한다', () => {
    const store = createNoticeStore();
    expect(store.listNotices().map(({ category }) => category)).toEqual([
      'operation',
      'submission',
      'session',
    ]);
    expect(store.listMembers()).toHaveLength(4);
    const seed = store.listNotices()[0];
    if (!seed) {
      throw new Error('예시 공지가 없습니다.');
    }
    expect(
      createNoticeStore([
        { ...seed, id: 'b' },
        { ...seed, id: 'a' },
      ])
        .listNotices()
        .map(({ id }) => id),
    ).toEqual(['a', 'b']);
  });
  it('생성은 고유 ID·작성일·전원 미열람·질문 0으로 시작하고 삭제는 대상만 제거한다', () => {
    const store = createNoticeStore([]);
    const first = store.createNotice(input);
    const second = store.createNotice(input);
    expect(first.id).not.toBe(second.id);
    expect(Number.isFinite(Date.parse(first.createdAt))).toBe(true);
    expect(first.unansweredCount).toBe(0);
    expect(Object.values(first.readAtByMemberId)).toEqual([null, null, null, null]);
    store.deleteNotice(first.id);
    expect(store.getNotice(first.id)).toBeNull();
    expect(store.listNotices()).toEqual([second]);
  });
  it('수정은 메타데이터를 유지하며 제외·재추가 회원의 읽음 기록을 초기화한다', () => {
    const store = createNoticeStore();
    const previous = store.getNotice('demo-session');
    const changed = store.updateNotice('demo-session', {
      ...input,
      category: 'session',
      audience: 'active',
    });
    expect(changed).toMatchObject({
      id: previous?.id,
      createdAt: previous?.createdAt,
      unansweredCount: previous?.unansweredCount,
    });
    expect(changed.readAtByMemberId).toEqual({
      'demo-web': '2026-10-20T01:00:00.000Z',
      'demo-design': null,
    });
    store.updateNotice(changed.id, { ...input, category: 'session', audience: 'completed' });
    expect(Object.values(store.updateNotice(changed.id, input).readAtByMemberId)).toEqual([
      null,
      null,
      null,
      null,
    ]);
  });
  it('없는 ID 수정·삭제와 잘못된 입력은 저장소를 바꾸지 않는다', () => {
    const store = createNoticeStore();
    const before = store.listNotices();
    expect(() => store.updateNotice('missing', input)).toThrow('공지를 찾을 수 없습니다.');
    expect(() => store.deleteNotice('missing')).toThrow('공지를 찾을 수 없습니다.');
    expect(() => store.createNotice({ ...input, title: '' })).toThrow(z.ZodError);
    expect(() => store.updateNotice('demo-session', { ...input, title: '' })).toThrow(z.ZodError);
    expect(store.listNotices()).toEqual(before);
  });
  it('저장 직전 ID 생성 실패에도 기존 공지를 유지한다', () => {
    const store = createNoticeStore();
    const before = store.listNotices();
    const spy = vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      throw new Error('예시 실패');
    });
    try {
      expect(() => store.createNotice(input)).toThrow('예시 실패');
    } finally {
      spy.mockRestore();
    }
    expect(store.listNotices()).toEqual(before);
  });
  it('입력·초기값·반환값의 변경이 내부 JSON과 명단에 영향을 주지 않는다', () => {
    const seed = createNoticeStore().listNotices();
    const store = createNoticeStore(seed);
    const before = store.listNotices();
    for (const notice of seed) {
      notice.bodyDocument.content = [];
    }
    for (const notice of store.listNotices()) {
      notice.readAtByMemberId = {};
      notice.bodyDocument.content = [];
    }
    for (const member of store.listMembers()) {
      member.name = '외부 변경';
    }
    expect(store.listNotices()).toEqual(before);
    expect(store.listMembers()[0]?.name).toBe('예시 웹회원');
    const fields = structuredClone(input);
    const created = store.createNotice(fields);
    fields.bodyDocument.content = [];
    created.bodyDocument.content = [];
    expect(store.getNotice(created.id)?.bodyDocument).toEqual(input.bodyDocument);
  });
});
