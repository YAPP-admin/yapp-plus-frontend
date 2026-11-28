export { noticeDetailData } from './model/notice-detail-data';
export {
  memberNoticeDetailQueryOptions,
  noticeDeadlineLabel,
  noticeDetailSchema,
  noticeIdFromParam,
  type MemberNoticeDetail,
} from './model/notice-detail-query';
export { useNoticeRead } from './model/use-notice-read';
export { NoticeDetailHeader, type NoticeDetailHeaderProps } from './ui/notice-detail-header';
export { NoticeDetailLoading } from './ui/notice-detail-loading';
export { NoticeDetailError } from './ui/notice-detail-error';

/** Activity가 본문 번들을 필요할 때 불러오도록 공개 진입점을 제공합니다. */
export const loadNoticeDetailPage = () => import('./ui/notice-detail-page');
