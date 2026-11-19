/** 개발 진입부 전용 회식 입력입니다. 화면은 이 모듈 대신 props를 받고 원본을 수정하지 않습니다. */
import { koreanTimestamp } from '@/shared/lib/korean-date-time';
import { DiningRound, type Dining, type DiningAttendance, type DiningMember } from './dining-model';

const CURRENT_MEMBER_ID = 'dining-demo-me';
const ABSENT_ATTENDANCE = {
  [DiningRound.FIRST]: false,
  [DiningRound.SECOND]: false,
} as const satisfies DiningAttendance;
const FIRST_ONLY_ATTENDANCE = {
  [DiningRound.FIRST]: true,
  [DiningRound.SECOND]: false,
} as const satisfies DiningAttendance;
const SECOND_ONLY_ATTENDANCE = {
  [DiningRound.FIRST]: false,
  [DiningRound.SECOND]: true,
} as const satisfies DiningAttendance;
const BOTH_ROUNDS_ATTENDANCE = {
  [DiningRound.FIRST]: true,
  [DiningRound.SECOND]: true,
} as const satisfies DiningAttendance;

const MEMBERS: readonly DiningMember[] = [
  {
    id: 'dining-demo-1',
    name: '이앱',
    groupName: '1팀',
    position: 'Designer',
    attendance: BOTH_ROUNDS_ATTENDANCE,
  },
  {
    id: 'dining-demo-2',
    name: '박피엠',
    groupName: '1팀',
    position: 'PM',
    attendance: FIRST_ONLY_ATTENDANCE,
  },
  {
    id: CURRENT_MEMBER_ID,
    name: '김와이',
    groupName: '운영진',
    position: 'Server',
    attendance: null,
  },
  {
    id: 'dining-demo-3',
    name: '최코틀',
    groupName: '2팀',
    position: 'Android',
    attendance: BOTH_ROUNDS_ATTENDANCE,
  },
  {
    id: 'dining-demo-4',
    name: '정스위',
    groupName: '3팀',
    position: 'iOS',
    attendance: ABSENT_ATTENDANCE,
  },
  { id: 'dining-demo-5', name: '강리액', groupName: '4팀', position: 'Web', attendance: null },
];

function createDiningFixture(
  id: string,
  title: string,
  surveyDate: string,
  startsDate: string,
  attendance: DiningAttendance | null,
): Dining {
  return {
    id,
    title,
    description:
      title === '33기 OT 뒤풀이'
        ? 'OT 끝나고 다 같이 저녁 먹어요! 33기 첫 회식이에요.'
        : '함께 저녁 먹어요! 회식 참석 여부를 알려 주세요.',
    startsAt: koreanTimestamp(startsDate, '18:30'),
    surveyClosesAt: koreanTimestamp(surveyDate, '23:59'),
    members: MEMBERS.map((member) =>
      member.id === CURRENT_MEMBER_ID ? { ...member, attendance } : member,
    ),
  };
}

const SCENARIOS = {
  openUnanswered: createDiningFixture(
    'open-unanswered',
    '33기 OT 뒤풀이',
    '2026-03-20',
    '2026-03-21',
    null,
  ),
  openAbsent: createDiningFixture(
    'open-absent',
    '디자인 팀 회식',
    '2026-03-21',
    '2026-03-22',
    ABSENT_ATTENDANCE,
  ),
  openRound1: createDiningFixture(
    'open-round1',
    '운영진 MT 회식',
    '2026-03-24',
    '2026-03-25',
    FIRST_ONLY_ATTENDANCE,
  ),
  openRound2: createDiningFixture(
    'open-round2',
    '안드로이드 팀 회식',
    '2026-03-22',
    '2026-03-23',
    SECOND_ONLY_ATTENDANCE,
  ),
  openBoth: createDiningFixture(
    'open-both',
    '33기 OT 뒤풀이',
    '2026-03-20',
    '2026-03-21',
    BOTH_ROUNDS_ATTENDANCE,
  ),
  closedAnswered: createDiningFixture(
    'closed-answered',
    '32기 수료 회식',
    '2026-03-18',
    '2026-03-19',
    BOTH_ROUNDS_ATTENDANCE,
  ),
  closedUnanswered: createDiningFixture(
    'closed-unanswered',
    '32기 수료 회식',
    '2026-03-18',
    '2026-03-19',
    null,
  ),
} as const;

const FIXTURES = {
  now: koreanTimestamp('2026-03-19', '12:00'),
  currentMemberId: CURRENT_MEMBER_ID,
  // 일반 목록은 네 건만 표시하고, 상태별 개발 링크에서는 전체 시나리오를 참조합니다.
  list: [
    SCENARIOS.openUnanswered,
    SCENARIOS.openAbsent,
    SCENARIOS.openRound1,
    SCENARIOS.openRound2,
    SCENARIOS.closedAnswered,
  ],
  scenarios: SCENARIOS,
} as const;

/** DEV에서만 읽을 수 있는 고정 입력입니다. 원본을 수정하지 않고 상세 종료 시 화면 응답을 폐기합니다. */
export function getDiningDevelopmentFixtures() {
  return import.meta.env.DEV ? FIXTURES : null;
}
