/** 재제출을 놓친 팀원과 계정 경계·손상·저장소 실패 시 표시 이력을 검증합니다. */
import { beforeEach, expect, it } from 'vitest';
import { createTeamAttendanceResultStorage } from './team-attendance-result-storage';

const SCOPE = { userId: 1, generationId: 28 };
const RESULT = { sessionId: 101, photoId: 203, kind: 'REJECTED' as const };
const KEY = 'yapp-plus:team-attendance:shown:v1:1:28';
beforeEach(() => localStorage.clear());

it('B가 중간 제출을 보지 못해도 새 사진 또는 개인 결과는 다시 안내한다', () => {
  const store = createTeamAttendanceResultStorage();
  expect(store.hasShown(SCOPE, RESULT)).toBe(false);
  store.markShown(SCOPE, RESULT);
  expect(store.hasShown(SCOPE, RESULT)).toBe(true);
  expect(store.hasShown(SCOPE, { ...RESULT, photoId: 204 })).toBe(false);
  expect(store.hasShown(SCOPE, { ...RESULT, kind: 'COMPLETED' })).toBe(false);
  expect(createTeamAttendanceResultStorage().hasShown(SCOPE, RESULT)).toBe(true);
  expect(JSON.parse(localStorage.getItem(KEY) ?? '{}')).toEqual({
    '101': { photoId: 203, result: 'REJECTED' },
  });
});

it('사용자·기수·세션을 분리하고 사진 없는 결석도 보존한다', () => {
  const store = createTeamAttendanceResultStorage();
  store.markShown(SCOPE, RESULT);
  expect(store.hasShown({ ...SCOPE, userId: 2 }, RESULT)).toBe(false);
  expect(store.hasShown({ ...SCOPE, generationId: 29 }, RESULT)).toBe(false);
  expect(store.hasShown(SCOPE, { ...RESULT, sessionId: 102 })).toBe(false);
  const absent = { ...RESULT, photoId: null, kind: 'ABSENT' as const };
  store.markShown(SCOPE, absent);
  expect(store.hasShown(SCOPE, absent)).toBe(true);
});

it.each([
  '{',
  'null',
  '{"101":{"photoId":-1,"result":"REJECTED"}}',
  '{"0":{"photoId":203,"result":"REJECTED"}}',
  '{"101":{"photoId":203,"result":"PENDING"}}',
])('손상 기록을 무시한다: %s', (raw) => {
  localStorage.setItem(KEY, raw);
  expect(createTeamAttendanceResultStorage().hasShown(SCOPE, RESULT)).toBe(false);
});

it.each(['access', 'write'])(
  '%s 실패 시 메모리로 대체하고 새 계정 수명에는 남기지 않는다',
  (failure) => {
    const getStorage = () => {
      if (failure === 'access') {
        throw new Error('접근 거부');
      }
      return {
        getItem: () => null,
        setItem: () => {
          throw new Error('용량 초과');
        },
      };
    };
    const store = createTeamAttendanceResultStorage(getStorage);
    store.markShown(SCOPE, RESULT);
    expect(store.hasShown(SCOPE, RESULT)).toBe(true);
    expect(createTeamAttendanceResultStorage(getStorage).hasShown(SCOPE, RESULT)).toBe(false);
  },
);
