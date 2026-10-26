import { describe, expect, it } from 'vitest';
import { createSessionInputSchema, type CreateSessionInput } from './session';
import { createSessionStore } from './sessions.mock';

const input = createSessionInputSchema.parse({
  name: '새 세션',
  location: { guide: '교육장' },
  date: '2026-11-01',
  startTime: '14:00',
  endTime: '17:00',
  type: 'team',
});

const offlineInput = {
  name: '수정 오프라인 세션',
  date: '2026-12-01',
  startTime: '15:00',
  endTime: '18:00',
  type: 'offline',
  location: {
    roadAddress: '서울특별시 중구 세종대로 110',
    detailAddress: '변경한 교육장',
    latitude: 37.5662,
    longitude: 126.9777,
  },
} satisfies CreateSessionInput;

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
      if (session.type === 'offline') {
        session.location.roadAddress = '외부 변경';
      } else {
        session.location.guide = '외부 변경';
      }
    }

    const listed = store.listSessions();
    for (const session of listed) {
      session.attendance.present = 888;
      if (session.type === 'offline') {
        session.location.latitude = 0;
      } else {
        session.location.guide = '조회값 변경';
      }
    }

    listed.pop();

    expect(store.listSessions()).toEqual(before);

    const created = store.createSession(input);
    created.name = '외부 수정';
    if (created.type === 'team') {
      created.location.guide = '외부 수정';
    }
    created.attendance.present = 777;

    expect(store.listSessions().find(({ id }) => id === created.id)).toMatchObject({
      name: input.name,
      location: input.location,
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

  it.each([input, offlineInput])(
    '$type으로 변경해도 ID·집계를 유지하고 이전 유형의 장소를 제거한다',
    (fields) => {
      const store = createSessionStore();
      const before = store.listSessions();
      const previous = before.find((session) => session.type !== fields.type);
      if (!previous) {
        throw new Error('전환할 예시 세션이 필요합니다.');
      }
      const edited = { ...fields, name: '수정 세션', date: '2026-12-01' };
      const submitted = {
        ...edited,
        // 입력에 여분의 필드가 섞여도 기존 ID·집계를 덮어쓸 수 없습니다.
        id: 'changed-id',
        attendance: { present: 999 },
      };
      const updated = store.updateSession(previous.id, submitted);

      expect(updated).toEqual({ ...edited, id: previous.id, attendance: previous.attendance });
      expect(store.listSessions()).toEqual([
        updated,
        ...before.filter((session) => session.id !== previous.id),
      ]);
    },
  );

  it('없는 ID나 잘못된 입력으로 수정하면 기존 데이터를 유지한다', () => {
    const store = createSessionStore();
    const before = store.listSessions();

    expect(() => store.updateSession('missing', input)).toThrow('수정할 세션을 찾을 수 없습니다.');
    expect(() => store.updateSession('demo-offline-session', { ...input, name: '' })).toThrow(
      '세션명을 입력하세요.',
    );
    expect(() =>
      store.updateSession('demo-offline-session', { ...input, endTime: '13:00' }),
    ).toThrow('종료 시간은 시작 시간보다 늦어야 합니다.');
    expect(store.listSessions()).toEqual(before);
  });

  it('수정 입력과 반환값의 중첩 객체를 바꿔도 저장값이 변하지 않는다', () => {
    const store = createSessionStore();
    const edited = { ...offlineInput, location: { ...offlineInput.location } };
    const updated = store.updateSession('demo-offline-session', edited);
    const saved = store.listSessions();

    edited.location.detailAddress = '입력 외부 변경';
    updated.attendance.present = 999;
    if (updated.type === 'offline') {
      updated.location.latitude = 0;
    }
    expect(store.listSessions()).toEqual(saved);
  });
});
