/** 종류 필터·조회 상태·목록 카드를 조합하며 필터 상태는 라우터가 소유한다. */
import { Link } from '@tanstack/react-router';
import { useAdminGeneration } from '~/features/admin-generation';
import { useAdminNoticeListQuery, NoticeQueryBoundary } from '~/features/notice-management';
import type { NoticeCategory } from '../model/notice-search';
import { Plus } from 'lucide-react';
import { ActionButton, Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import { useEffect } from 'react';
import { NoticeList, NoticeListLoading } from './notice-list';
import { NoticeListHeader } from './notice-list-header';
import { NoticeCategoryFilter } from './notice-category-filter';
import * as styles from './notices-page.css';

type Props = {
  category: NoticeCategory;
  noticeError?: 'not-found';
  onCategoryChange: (category: NoticeCategory) => void;
  onNoticeErrorHandled: () => void;
};

/** 탐색 UI는 항상 유지하고 데이터 영역만 클라이언트 전용 경계로 감싼다. */
export function NoticesPage({
  category,
  noticeError,
  onCategoryChange,
  onNoticeErrorHandled,
}: Props) {
  const { currentGeneration } = useAdminGeneration();
  const snackbar = useSnackbarAdapter();

  useEffect(() => {
    if (noticeError !== 'not-found') {
      return;
    }

    snackbar.create({
      render: () => <Snackbar variant="critical" message="존재하지 않는 공지입니다." />,
    });
    onNoticeErrorHandled();
  }, [noticeError, onNoticeErrorHandled, snackbar]);

  return (
    <main className={styles.page}>
      <NoticeListHeader />

      <ActionButton asChild variant="neutralSolid" className={styles.createLink}>
        <Link to="/notices/new" search={{}} aria-label="공지 작성">
          <Plus size={17} aria-hidden="true" />
          게시글 작성하기
        </Link>
      </ActionButton>

      <NoticeCategoryFilter category={category} onCategoryChange={onCategoryChange} />

      <NoticeQueryBoundary fallback={<NoticeListLoading />}>
        <NoticesData category={category} generationId={currentGeneration.generationId} />
      </NoticeQueryBoundary>
    </main>
  );
}

/** 병렬 조회가 끝난 목록과 명단으로 집계와 카드를 표시한다. */
function NoticesData({
  category,
  generationId,
}: Pick<Props, 'category'> & { generationId: number }) {
  const noticeList = useAdminNoticeListQuery(generationId, category);

  return (
    <NoticeList
      category={category}
      generationId={generationId}
      notices={noticeList.notices}
      totalPostCount={noticeList.totalPostCount}
      hasNextPage={noticeList.hasNextPage}
      isFetchingNextPage={noticeList.isFetchingNextPage}
      onFetchNextPage={() => void noticeList.fetchNextPage()}
    />
  );
}
