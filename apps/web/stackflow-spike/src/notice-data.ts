import {
  DEFAULT_NOTICE_DETAILS,
  type NoticeDetail,
} from '../../src/pages/notice-detail/model/notice-detail-data';

export type NoticeCategory = 'ALL' | NoticeDetail['category'];

export const noticeCategories: { id: NoticeCategory; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'SESSION', label: '세션' },
  { id: 'ASSIGNMENT', label: '과제' },
  { id: 'ETC', label: '기타' },
];

export const notices = Object.values(DEFAULT_NOTICE_DETAILS).map(
  ({ id, category, categoryLabel, title, date, dDay }) => ({
    id,
    category,
    categoryLabel,
    title,
    date,
    dDay,
  }),
);

export function getNoticeById(id: string): NoticeDetail | undefined {
  return DEFAULT_NOTICE_DETAILS[id];
}
