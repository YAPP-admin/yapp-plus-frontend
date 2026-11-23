/** 회식 화면의 읽기 전용 입력과 순수 응답 규칙을 정의하며 API·저장 수명은 소유하지 않습니다. */
import { koreanDateString, koreanTimestamp } from '@/shared/lib/korean-date-time';

/** 회식 차수를 식별하는 공용 값입니다. 화면 표시는 `diningRoundLabel`을 사용합니다. */
export enum DiningRound {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
}

/** 차수별 참석 여부입니다. 두 차수는 독립적이므로 2차만 참석도 유효한 응답입니다. */
export type DiningAttendance = Readonly<Record<DiningRound, boolean>>;

/** 아직 고르지 않은 차수는 null이며, 두 차수의 선택을 마쳐야 제출할 수 있습니다. */
export type DiningDraft = Readonly<Record<DiningRound, boolean | null>>;

/** groupName은 운영진·1팀처럼 회원 이름 아래에 표시하는 소속 문구입니다. 미응답은 집계에 포함하지 않습니다. */
export type DiningMember = Readonly<{
  id: string;
  name: string;
  groupName: string;
  position: string;
  attendance: DiningAttendance | null;
}>;

/** 시각은 검증된 epoch 밀리초이며, 공급부는 회식 내 고유한 회원 ID와 명단 순서를 보장합니다. */
export type Dining = Readonly<{
  id: string;
  title: string;
  description: string;
  startsAt: number;
  surveyClosesAt: number;
  members: readonly DiningMember[];
}>;

/** 불참은 두 차수 모두 불참한 응답자만 포함하며, 차수별 명단은 중복될 수 있습니다. */
export type DiningMemberFilter = DiningRound | 'ABSENT';

/** 1차·2차를 화면에 표시할 때 사용하는 고정 문구입니다. */
export const diningRoundLabel = {
  [DiningRound.FIRST]: '1차',
  [DiningRound.SECOND]: '2차',
} as const;

/** 제출값에서 편집 초안을 새로 만듭니다. null은 최초 미응답 상태입니다. */
export function createDiningDraft(attendance: DiningAttendance | null): DiningDraft {
  if (attendance === null) {
    return { [DiningRound.FIRST]: null, [DiningRound.SECOND]: null };
  }
  return {
    [DiningRound.FIRST]: attendance[DiningRound.FIRST],
    [DiningRound.SECOND]: attendance[DiningRound.SECOND],
  };
}

/** 두 차수는 독립적으로 선택합니다. 원본 초안은 수정하지 않습니다. */
export function selectDiningRound(
  draft: DiningDraft,
  round: DiningRound,
  attending: boolean,
): DiningDraft {
  return { ...draft, [round]: attending };
}

/** 두 차수 선택이 완성되면 참석 응답을 반환하며, 미완성 초안에는 null을 반환합니다. */
export function toDiningAttendance(draft: DiningDraft): DiningAttendance | null {
  if (draft[DiningRound.FIRST] === null || draft[DiningRound.SECOND] === null) {
    return null;
  }
  return {
    [DiningRound.FIRST]: draft[DiningRound.FIRST],
    [DiningRound.SECOND]: draft[DiningRound.SECOND],
  };
}

/** 현재 사용자가 필터에 포함될 때만 먼저 표시하고, 나머지 입력 순서와 원본 배열은 유지합니다. */
export function selectDiningMembers(
  members: readonly DiningMember[],
  filter: DiningMemberFilter,
  currentMemberId: string,
): readonly DiningMember[] {
  const selected = members.filter((member) => matchesDiningFilter(member.attendance, filter));
  return [
    ...selected.filter(({ id }) => id === currentMemberId),
    ...selected.filter(({ id }) => id !== currentMemberId),
  ];
}

/** 목록의 참여 인원은 참석 여부와 관계없이 투표를 제출한 고유 인원입니다. */
export function countDiningMembers(members: readonly DiningMember[]) {
  return {
    RESPONDED: members.filter(({ attendance }) => attendance !== null).length,
    [DiningRound.FIRST]: members.filter((member) =>
      matchesDiningFilter(member.attendance, DiningRound.FIRST),
    ).length,
    [DiningRound.SECOND]: members.filter((member) =>
      matchesDiningFilter(member.attendance, DiningRound.SECOND),
    ).length,
    ABSENT: members.filter((member) => matchesDiningFilter(member.attendance, 'ABSENT')).length,
  };
}

function matchesDiningFilter(
  attendance: DiningAttendance | null,
  filter: DiningMemberFilter,
): boolean {
  if (attendance === null) {
    return false;
  }
  if (filter === 'ABSENT') {
    return !attendance[DiningRound.FIRST] && !attendance[DiningRound.SECOND];
  }
  return attendance[filter];
}

/** 기한과 기준 시각은 epoch 밀리초입니다. 기한부터 마감이며, 남은 날짜는 한국 달력일로 셉니다. */
export function getDiningDeadline(surveyClosesAt: number, now: number) {
  if (now >= surveyClosesAt) {
    return { status: 'closed', label: '투표 마감' } as const;
  }
  // 남은 24시간 단위가 아니라 한국 날짜의 자정끼리 비교해 자정 직전에도 D-1을 유지합니다.
  const days =
    (koreanTimestamp(koreanDateString(surveyClosesAt)) - koreanTimestamp(koreanDateString(now))) /
    86_400_000;
  return { status: 'open', label: days === 0 ? 'D-day' : `D-${days}` } as const;
}
