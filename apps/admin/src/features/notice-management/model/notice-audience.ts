/**
 * 검증된 공지와 회원 명단에서 노출 대상을 선택하고 대상 변경 시 읽음 기록을 계산한다.
 * 전달받은 명단과 기록은 변경하지 않는다.
 */
import type { Member, NoticeContent, ReadRecords } from './notice';

/** 일반 공지는 회원 구분으로, 제출 공지는 활동회원 내 전체 또는 선택 직군으로 필터링한다. */
export function getNoticeAudience(notice: NoticeContent, members: readonly Member[]) {
  return members.filter((member) =>
    notice.category === 'submission'
      ? member.membership === 'active' &&
        (notice.audience === 'all' || notice.audience.includes(member.job))
      : notice.audience === 'all' || member.membership === notice.audience,
  );
}

/**
 * 이전·다음 대상의 교집합에 대해서만 기존 확인 시각을 보존한다.
 * 제외된 회원은 반환 기록에서 제거하고 신규·재추가 회원은 null(미열람)로 만든다.
 */
export function reconcileReadRecords(
  previous: ReadRecords,
  previousMembers: readonly Member[],
  nextMembers: readonly Member[],
): ReadRecords {
  const previousIds = new Set(previousMembers.map((member) => member.id));
  return Object.fromEntries(
    nextMembers.map(({ id }) => [
      id,
      previousIds.has(id) && Object.hasOwn(previous, id) ? (previous[id] ?? null) : null,
    ]),
  );
}
