/**
 * 현재 대상 회원의 읽음 표·집계와 한국 시간 기준 마감 문구를 계산한다.
 * 회원 ID가 고유한 대상 명단과 검증된 읽음 기록을 입력받으며 현재 시각은 호출자가 전달한다.
 */
import type { Member, ReadRecords } from './notice';

type NoticeReader = { member: Member; readAt: string | null };

/** 읽은 회원을 먼저 두고 확인 시각 내림차순, 미열람은 이름순으로 비교한다. 동률은 ID순이다. */
function compareNoticeReaders(a: NoticeReader, b: NoticeReader) {
  if (a.readAt && !b.readAt) {
    return -1;
  }
  if (!a.readAt && b.readAt) {
    return 1;
  }
  const order =
    a.readAt && b.readAt
      ? Date.parse(b.readAt) - Date.parse(a.readAt)
      : a.member.name.localeCompare(b.member.name, 'ko');
  return order || a.member.id.localeCompare(b.member.id, 'en');
}

/**
 * 현재 대상 전원의 행을 만들어 읽음 시각 내림차순, 미열람 이름순으로 정렬한다.
 * 정렬 기준이 같으면 ID로 순서를 고정하고, 원본 명단·기록은 유지한다.
 */
export function getNoticeReaders(members: readonly Member[], records: ReadRecords) {
  return members
    .map((member) => ({
      member,
      readAt: Object.hasOwn(records, member.id) ? (records[member.id] ?? null) : null,
    }))
    .toSorted(compareNoticeReaders);
}

/** 현재 대상만 집계한다. 읽음 비율은 정수로 반올림하며 대상이 없으면 모든 수치를 0으로 반환한다. */
export function getNoticeSummary(members: readonly Member[], records: ReadRecords) {
  const targetCount = members.length;
  const readCount = members.filter(
    ({ id }) => Object.hasOwn(records, id) && records[id] != null,
  ).length;
  return {
    targetCount,
    readCount,
    unreadCount: targetCount - readCount,
    readPercentage: targetCount ? Math.round((readCount / targetCount) * 100) : 0,
  };
}

/** UTC 밀리초에 한국 시차를 더해 날짜 번호로 바꾼다. 실행 환경의 현지 시간대에 의존하지 않는다. */
const koreanDay = (time: number) => Math.floor((time + 9 * 60 * 60 * 1000) / 86400000);

/**
 * 마감 정각부터 마감으로 표시하고, 그 전에는 한국 날짜 차이로 D-day 또는 D-N을 반환한다.
 * 현재 시각을 주입받아 시간 경계를 재현하며 잘못된 시각은 예외로 거절한다.
 */
export function getNoticeDeadline(deadlineAt: string, now: Date) {
  const deadline = Date.parse(deadlineAt);
  const current = now.getTime();
  if (!Number.isFinite(deadline) || !Number.isFinite(current)) {
    throw new Error('올바른 마감·현재 시각이 필요합니다.');
  }
  if (current >= deadline) {
    return '마감';
  }
  const days = koreanDay(deadline) - koreanDay(current);
  return days === 0 ? 'D-day' : `D-${days}`;
}
