/** 조회 상태와 필터 결과를 공지 목록으로 표현한다. */
import { ActionButton } from '@yapp-plus/ui';
import type { useNoticesQuery, useNoticeMembersQuery } from '~/features/notice-management';
import type { NoticeCategory } from '../model/notice-search';
import { NoticeCard } from './notice-card';
import * as styles from './notice-list.css';

/** 조회·필터 변경으로 렌더링할 때 현재 시각으로 마감을 다시 계산한다. */
export function NoticeList({
  category,
  available,
  noticesQuery,
  membersQuery,
}: {
  category: NoticeCategory;
  available: boolean;
  noticesQuery: ReturnType<typeof useNoticesQuery>;
  membersQuery: ReturnType<typeof useNoticeMembersQuery>;
}) {
  /** 공지와 명단을 함께 재조회해 집계를 복구한다. */
  function retry() {
    void noticesQuery.refetch();
    void membersQuery.refetch();
  }

  if (!available) {
    return <p className={styles.placeholder}>공지 관리 기능을 준비 중입니다.</p>;
  }

  if (noticesQuery.isError || membersQuery.isError) {
    return (
      <div role="alert" className={styles.placeholder}>
        <p>공지 목록을 불러오지 못했습니다.</p>
        <ActionButton
          variant="neutralWeak"
          onClick={retry}
          disabled={noticesQuery.isFetching || membersQuery.isFetching}
        >
          다시 시도
        </ActionButton>
      </div>
    );
  }

  if (!noticesQuery.isSuccess || !membersQuery.isSuccess) {
    return <output className={styles.placeholder}>공지 목록을 불러오는 중입니다.</output>;
  }

  const notices = noticesQuery.data;
  const filtered = notices.filter((notice) => category === 'all' || notice.category === category);
  const now = new Date();

  return (
    <>
      <div className={styles.results}>
        <p aria-live="polite">
          총 <strong>{filtered.length}</strong>개
        </p>
        <p>개발용 예시 데이터입니다.</p>
      </div>
      {filtered.length === 0 ? (
        <p className={styles.placeholder}>
          {notices.length === 0 ? '등록된 공지가 없습니다.' : '선택한 종류의 공지가 없습니다.'}
        </p>
      ) : (
        <ul className={styles.list} aria-label="공지 목록">
          {filtered.map((notice) => (
            <li key={notice.id}>
              <NoticeCard notice={notice} members={membersQuery.data} now={now} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
