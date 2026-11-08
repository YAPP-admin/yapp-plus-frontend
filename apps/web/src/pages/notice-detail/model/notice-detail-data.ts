/** 공지 상세 API 모델을 화면이 필요한 표시값으로 변환한다. */
import { memberNoticeCategoryLabel, memberNoticeDateLabel } from '@/features/member-notice';
import { noticeDeadlineLabel, type MemberNoticeDetail } from './notice-detail-query';

/** 공지 상세의 카테고리·제출 안내·첨부 표시값을 한 화면 모델로 만든다. */
export function noticeDetailData(detail: MemberNoticeDetail, now = Date.now()) {
  const assignment = detail.assignment;
  return {
    ...detail,
    categoryLabel: memberNoticeCategoryLabel(detail.type),
    createdDateLabel: memberNoticeDateLabel(detail.createdDate),
    deadline: assignment
      ? {
          label: memberNoticeDateLabel(assignment.deadlineDate),
          dDay: noticeDeadlineLabel(assignment.deadlineDate, now),
          positions: assignment.positions.join(', '),
          submissionUrl: assignment.submissionUrl,
          submissionLinkText: assignment.submissionLinkText,
        }
      : undefined,
  };
}
