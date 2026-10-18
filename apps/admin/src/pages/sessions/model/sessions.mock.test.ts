/** 세션 메모리 저장소의 조회·생성·수정·삭제와 데이터 격리를 검증합니다. */
import { describe, expect, it } from 'vitest';
import { createSessionInputSchema } from './session';
import { createSessionStore } from './sessions.mock';

const input = createSessionInputSchema.parse({
  name: '새 세션',
  location: '교육장',
  date: '2026-11-01',
  startTime: '14:00',
  endTime: '17:00',
  type: 'team',
});

describe('세션 메모리 저장소', () => {
  it('서로 다른 id로 생성하고 집계는 0에서 시작하며 대상만 삭제한다', () => {
    const store = createSessionStore([]);

    const first = store.createSession(input);
    const second = store.createSession(input);

    expect(first.id).not.toBe(second.id);
    expect(first.attendance).toEqual({ present: 0, late: 0, absent: 0, pending: 0, reported: 0 });
    expect(store.listSessions()).toEqual([first, second]);

    store.deleteSession(first.id);

    expect(store.listSessions()).toEqual([second]);

    store.deleteSession(second.id);

    expect(store.listSessions()).toEqual([]);
  });

  it('검증 실패와 없는 id 삭제는 기존 데이터를 바꾸지 않는다', () => {
    const store = createSessionStore();
    const before = store.listSessions();

    expect(() => store.createSession({ ...input, name: ' ' })).toThrow('세션명을 입력하세요.');
    expect(() => store.deleteSession('missing')).toThrow('삭제할 세션을 찾을 수 없습니다.');

    expect(store.listSessions()).toEqual(before);
  });

  it('초기 데이터와 생성·조회 반환값의 변경이 내부 저장소로 새지 않는다', () => {
    const seed = createSessionStore().listSessions();
    const store = createSessionStore(seed);
    const before = store.listSessions();

    for (const session of seed) {
      session.attendance.present = 999;
    }

    const listed = store.listSessions();
    for (const session of listed) {
      session.attendance.present = 888;
    }

    listed.pop();

    expect(store.listSessions()).toEqual(before);

    const created = store.createSession(input);
    created.name = '외부 수정';
    created.attendance.present = 777;

    expect(store.listSessions().find(({ id }) => id === created.id)).toMatchObject({
      name: input.name,
      attendance: { present: 0 },
    });
  });

  it('새 저장소는 이전 저장소의 변경 없이 기본 예시로 시작한다', () => {
    const first = createSessionStore();
    const original = first.listSessions();

    first.createSession(input);

    expect(createSessionStore().listSessions()).toEqual(original);
    expect(first.listSessions()).toHaveLength(original.length + 1);
  });
});

it('수정 시 id·집계를 보존하고 변경한 일정순으로 정렬하며 반환값을 격리한다', () => {
  const store = createSessionStore();
  const original = store.listSessions().find((session) => session.id === 'demo-regular-session');
  const updated = store.updateSession({
    id: 'demo-regular-session',
    input: { ...input, date: '2026-12-01' },
  });
  expect(updated.id).toBe('demo-regular-session');
  expect(updated.attendance).toEqual(original?.attendance);
  expect(store.listSessions()[0]).toEqual(updated);
  updated.name = '외부 변경';
  updated.attendance.present = 999;
  expect(store.listSessions()[0]?.name).toBe(input.name);
  expect(store.listSessions()[0]?.attendance).toEqual(original?.attendance);
});

it('없는 세션이나 잘못된 입력은 수정하거나 생성하지 않는다', () => {
  const store = createSessionStore();
  const before = store.listSessions();
  expect(() => store.updateSession({ id: 'missing', input })).toThrow(
    '수정할 세션을 찾을 수 없습니다.',
  );
  expect(() =>
    store.updateSession({ id: 'demo-regular-session', input: { ...input, name: '' } }),
  ).toThrow('세션명을 입력하세요.');
  expect(store.listSessions()).toEqual(before);
});
