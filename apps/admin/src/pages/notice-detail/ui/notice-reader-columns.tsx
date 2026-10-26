/** 읽음 표의 데이터 접근·표시·컬럼별 비교 기준을 선언한다. */
import {
  createColumnHelper,
  tableFeatures,
  rowSortingFeature,
  createSortedRowModel,
  sortFns,
} from '@tanstack/react-table';
import type { getNoticeReaders } from '~/features/notice-management';

export type NoticeReader = ReturnType<typeof getNoticeReaders>[number];

/** 읽음 표에서 사용하는 정렬 기능과 비교 함수만 등록한다. */
export const readerFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

const column = createColumnHelper<typeof readerFeatures, NoticeReader>();
const membershipLabels = { active: '활동회원', regular: '정회원', completed: '수료회원' };
const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  dateStyle: 'short',
  timeStyle: 'short',
});

export const readerColumns = column.columns([
  column.accessor('member.name', {
    header: '이름',
    sortFn: (a, b) => a.original.member.name.localeCompare(b.original.member.name, 'ko'),
  }),
  column.accessor('member.cohort', {
    header: '기수',
    cell: (info) => `${info.getValue()}기`,
    sortFn: 'basic',
  }),
  column.accessor('member.job', { header: '직군', sortFn: 'text' }),
  column.accessor((row) => membershipLabels[row.member.membership], {
    id: 'membership',
    header: '회원 구분',
    sortFn: 'text',
  }),
  column.accessor((row) => (row.readAt ? 1 : 0), {
    id: 'read',
    header: '읽음 여부',
    cell: (info) => (info.getValue() ? '읽음' : '미열람'),
    sortFn: 'basic',
  }),
  column.accessor((row) => (row.readAt ? Date.parse(row.readAt) : undefined), {
    id: 'readAt',
    header: '확인 시각',
    sortFn: 'basic',
    sortUndefined: 'last',
    cell: ({ row }) =>
      row.original.readAt ? (
        <time dateTime={row.original.readAt}>
          {dateFormat.format(new Date(row.original.readAt))}
        </time>
      ) : (
        '—'
      ),
  }),
]);
