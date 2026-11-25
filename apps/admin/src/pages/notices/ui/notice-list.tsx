/** 조회 상태와 필터 결과를 공지 목록으로 표현한다. */
import { Skeleton, VStack } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { AdminPostListItemResponse } from '@yapp-plus/api/generated';
import type { NoticeCategory } from '../model/notice-search';
import { NoticeCard } from './notice-card';
import * as styles from './notice-list.css';

/** 조회·필터 변경으로 렌더링할 때 현재 시각으로 마감을 다시 계산한다. */
export function NoticeList({
  category,
  generationId,
  notices,
  totalPostCount,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: {
  category: NoticeCategory;
  generationId: number;
  notices: AdminPostListItemResponse[];
  totalPostCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}) {
  const now = new Date();
  let emptyMessage = '선택한 종류의 공지가 없습니다.';
  if (totalPostCount > 0) {
    emptyMessage = '공지 목록을 불러오지 못했습니다.';
  } else if (category === 'all') {
    emptyMessage = '등록된 공지가 없습니다.';
  }

  return (
    <>
      <div className={styles.results}>
        <p aria-live="polite">
          총 <strong>{totalPostCount}</strong>개
        </p>
      </div>

      {notices.length === 0 ? (
        <p className={styles.placeholder}>
          {emptyMessage}
        </p>
      ) : (
        <ul className={styles.list} aria-label="공지 목록">
          {notices.map((notice) => (
            <li key={notice.postId}>
              <NoticeCard notice={notice} generationId={generationId} now={now} />
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <ActionButton
          type="button"
          variant="neutralWeak"
          loading={isFetchingNextPage}
          onClick={onFetchNextPage}
        >
          더 불러오기
        </ActionButton>
      )}
    </>
  );
}

/** 조회 전에도 개수 안내와 카드 세 개 정도의 공간을 확보한다. */
export function NoticeListLoading() {
  return (
    <VStack gap="x3" aria-busy="true">
      <output>공지 목록을 불러오는 중입니다.</output>

      <VStack gap="x2" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} width="full" height={{ base: '150px', lg: '106px' }} radius="16" />
        ))}
      </VStack>
    </VStack>
  );
}
