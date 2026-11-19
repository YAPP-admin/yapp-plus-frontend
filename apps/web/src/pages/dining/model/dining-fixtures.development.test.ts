/** 개발 입력의 노출 조건·사례 구성·초기화에 필요한 원본 보존을 검증합니다. */
import { afterEach, expect, it, vi } from 'vitest';
import { getDiningDevelopmentFixtures } from './dining-fixtures.development';
import {
  DiningRound,
  createDiningDraft,
  getDiningDeadline,
  selectDiningRound,
} from './dining-model';

const FIRST_ONLY = { [DiningRound.FIRST]: true, [DiningRound.SECOND]: false } as const;
const SECOND_ONLY = { [DiningRound.FIRST]: false, [DiningRound.SECOND]: true } as const;
const BOTH = { [DiningRound.FIRST]: true, [DiningRound.SECOND]: true } as const;
const ABSENT = { [DiningRound.FIRST]: false, [DiningRound.SECOND]: false } as const;

afterEach(() => vi.unstubAllEnvs());

it('운영에서는 목업 설정으로도 fixture를 읽을 수 없다', () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_API_MOCKING', 'true');
  expect(getDiningDevelopmentFixtures()).toBeNull();
});

it('로컬에서는 API 목업 설정과 무관하게 일곱 사례를 공급한다', () => {
  vi.stubEnv('DEV', true);
  const fixtures = getDiningDevelopmentFixtures();
  if (!fixtures) {
    throw new Error('개발 fixture가 필요합니다.');
  }
  expect(fixtures.now).toBe(Date.parse('2026-03-19T12:00:00+09:00'));
  expect(
    Object.values(fixtures.scenarios).map((dining) => ({
      status: getDiningDeadline(dining.surveyClosesAt, fixtures.now).status,
      attendance: dining.members.find(({ id }) => id === fixtures.currentMemberId)?.attendance,
    })),
  ).toEqual([
    { status: 'open', attendance: null },
    { status: 'open', attendance: ABSENT },
    { status: 'open', attendance: FIRST_ONLY },
    { status: 'open', attendance: SECOND_ONLY },
    { status: 'open', attendance: BOTH },
    { status: 'closed', attendance: BOTH },
    { status: 'closed', attendance: null },
  ]);
});

it('상세 초안을 바꿔도 다음 진입의 원본 응답은 유지한다', () => {
  vi.stubEnv('DEV', true);
  const fixtures = getDiningDevelopmentFixtures();
  if (!fixtures) {
    throw new Error('개발 fixture가 필요합니다.');
  }
  const member = fixtures.scenarios.openRound1.members.find(
    ({ id }) => id === fixtures.currentMemberId,
  );
  if (!member) {
    throw new Error('현재 사용자가 필요합니다.');
  }
  expect(selectDiningRound(createDiningDraft(member.attendance), DiningRound.SECOND, true)).toEqual(
    BOTH,
  );
  expect(
    getDiningDevelopmentFixtures()?.scenarios.openRound1.members.find(({ id }) => id === member.id)
      ?.attendance,
  ).toEqual(FIRST_ONLY);
});
