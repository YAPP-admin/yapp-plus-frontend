/** 네 응답 조합·명단 집계·한국 날짜 경계를 가장 가까운 모델 계층에서 검증합니다. */
import { describe, expect, it } from 'vitest';
import { koreanTimestamp } from '@/shared/lib/korean-date-time';
import {
  DiningRound,
  countDiningMembers,
  createDiningDraft,
  getDiningDeadline,
  selectDiningMembers,
  selectDiningRound,
  toDiningAttendance,
  type DiningAttendance,
  type DiningMember,
} from './dining-model';

const ABSENT = {
  [DiningRound.FIRST]: false,
  [DiningRound.SECOND]: false,
} as const satisfies DiningAttendance;
const FIRST_ONLY = {
  [DiningRound.FIRST]: true,
  [DiningRound.SECOND]: false,
} as const satisfies DiningAttendance;
const SECOND_ONLY = {
  [DiningRound.FIRST]: false,
  [DiningRound.SECOND]: true,
} as const satisfies DiningAttendance;
const BOTH = {
  [DiningRound.FIRST]: true,
  [DiningRound.SECOND]: true,
} as const satisfies DiningAttendance;

describe('회식 응답 선택', () => {
  it.each([
    { attendance: ABSENT },
    { attendance: FIRST_ONLY },
    { attendance: SECOND_ONLY },
    { attendance: BOTH },
  ])('완성된 $attendance를 편집 초안으로 복원한다', ({ attendance }) => {
    expect(toDiningAttendance(createDiningDraft(attendance))).toEqual(attendance);
  });

  it('두 차수를 각각 선택해 2차만 참석으로 제출할 수 있다', () => {
    const first = selectDiningRound(createDiningDraft(null), DiningRound.FIRST, false);
    expect(toDiningAttendance(first)).toBeNull();
    expect(toDiningAttendance(selectDiningRound(first, DiningRound.SECOND, true))).toEqual(
      SECOND_ONLY,
    );
  });

  it('1차만 참석과 모두 불참도 독립적으로 제출한다', () => {
    expect(toDiningAttendance({ [DiningRound.FIRST]: true, [DiningRound.SECOND]: false })).toEqual(
      FIRST_ONLY,
    );
    expect(toDiningAttendance({ [DiningRound.FIRST]: false, [DiningRound.SECOND]: false })).toEqual(
      ABSENT,
    );
  });

  it('두 차수 중 하나라도 미선택이면 제출할 수 없다', () => {
    expect(
      toDiningAttendance({ [DiningRound.FIRST]: null, [DiningRound.SECOND]: true }),
    ).toBeNull();
    expect(
      toDiningAttendance({ [DiningRound.FIRST]: false, [DiningRound.SECOND]: null }),
    ).toBeNull();
  });
});

const MEMBERS: readonly DiningMember[] = [
  { id: 'a', name: '가', groupName: '1팀', position: 'Web', attendance: BOTH },
  { id: 'b', name: '나', groupName: '2팀', position: 'PM', attendance: FIRST_ONLY },
  {
    id: 'me',
    name: '현재 사용자',
    groupName: '운영진',
    position: 'Server',
    attendance: SECOND_ONLY,
  },
  { id: 'c', name: '다', groupName: '3팀', position: 'iOS', attendance: ABSENT },
  { id: 'd', name: '라', groupName: '4팀', position: 'Android', attendance: null },
];

describe('회식 명단과 집계', () => {
  it('2차만 참석한 사람은 2차 명단과 고유 참여 인원에 포함한다', () => {
    expect(countDiningMembers(MEMBERS)).toEqual({
      ATTENDING: 3,
      [DiningRound.FIRST]: 2,
      [DiningRound.SECOND]: 2,
      ABSENT: 1,
    });
    expect(selectDiningMembers(MEMBERS, DiningRound.FIRST, 'me').map(({ id }) => id)).toEqual([
      'a',
      'b',
    ]);
    expect(selectDiningMembers(MEMBERS, DiningRound.SECOND, 'me').map(({ id }) => id)).toEqual([
      'me',
      'a',
    ]);
    expect(selectDiningMembers(MEMBERS, 'ABSENT', 'me').map(({ id }) => id)).toEqual(['c']);
  });
});

describe('회식 조사 마감', () => {
  it('한국 달력일을 사용해 D-day와 마감을 구분한다', () => {
    const deadline = koreanTimestamp('2026-03-20', '23:59');
    expect(getDiningDeadline(deadline, koreanTimestamp('2026-03-19', '23:59:59'))).toEqual({
      status: 'open',
      label: 'D-1',
    });
    expect(getDiningDeadline(deadline, koreanTimestamp('2026-03-20', '00:00'))).toEqual({
      status: 'open',
      label: 'D-day',
    });
    expect(getDiningDeadline(deadline, deadline)).toEqual({ status: 'closed', label: '투표 마감' });
  });
});
