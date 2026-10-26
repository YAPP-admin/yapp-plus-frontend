/** 종류 필터·조회 상태·목록 카드를 조합하며 필터 상태는 라우터가 소유한다. */
import { Link } from '@tanstack/react-router';
import { useNoticesQuery, NoticeQueryBoundary } from '~/features/notice-management';
import type { NoticeCategory } from '../model/notice-search';
import { Plus } from 'lucide-react';
import { ActionButton } from '@yapp-plus/ui';
import { NoticeList, NoticeListLoading } from './notice-list';
import { NoticeListHeader } from './notice-list-header';
import { NoticeCategoryFilter } from './notice-category-filter';
import * as styles from './notices-page.css';

type Props = {
  category: NoticeCategory;
  onCategoryChange: (category: NoticeCategory) => void;
};

/** 탐색 UI는 항상 유지하고 데이터 영역만 클라이언트 전용 경계로 감싼다. */
export function NoticesPage({ category, onCategoryChange }: Props) {
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
        <NoticesData category={category} />
      </NoticeQueryBoundary>
    </main>
  );
}

/** 병렬 조회가 끝난 목록과 명단으로 집계와 카드를 표시한다. */
function NoticesData({ category }: Pick<Props, 'category'>) {
  const { notices, members } = useNoticesQuery();

  return <NoticeList category={category} notices={notices} members={members} />;
}
