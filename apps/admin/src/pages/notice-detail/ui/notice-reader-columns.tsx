/** 읽음 표의 데이터 접근·표시·컬럼별 비교 기준을 선언한다. */
import {
  createColumnHelper,
  tableFeatures,
  rowSortingFeature,
  createSortedRowModel,
  sortFns,
} from '@tanstack/react-table';
import type { getNoticeReaders } from '~/features/notice-management';
import * as styles from './notice-readers.css';

export type NoticeReader = ReturnType<typeof getNoticeReaders>[number];

/** 읽음 표에서 사용하는 정렬 기능과 비교 함수만 등록한다. */
export const readerFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

const column = createColumnHelper<typeof readerFeatures, NoticeReader>();
const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  dateStyle: 'short',
  timeStyle: 'short',
});

export const readerColumns = column.columns([
  column.accessor('member.name', {
    header: '이름',
    cell: (info) => (
      <span className={styles.memberCell}>
        <span className={styles.avatar} aria-hidden="true">
          {info.getValue().slice(0, 1)}
        </span>
        <span>{info.getValue()}</span>
      </span>
    ),
    sortFn: (a, b) => a.original.member.name.localeCompare(b.original.member.name, 'ko'),
  }),
  column.accessor((row) => `${row.member.cohort}기 · ${row.member.job}`, {
    id: 'cohortJob',
    header: '기수 · 직군',
    cell: (info) => <span className={styles.memberMeta}>{info.getValue()}</span>,
    sortFn: (a, b) =>
      a.original.member.cohort - b.original.member.cohort ||
      a.original.member.job.localeCompare(b.original.member.job, 'ko'),
  }),
  column.accessor((row) => (row.readAt ? 1 : 0), {
    id: 'read',
    header: '읽음 여부',
    cell: (info) => (
      <span
        className={info.getValue() ? styles.readStatus : styles.unreadStatus}
        aria-label={info.getValue() ? '읽음' : '안 읽음'}
      >
        {info.getValue() ? 'Y' : 'N'}
      </span>
    ),
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
