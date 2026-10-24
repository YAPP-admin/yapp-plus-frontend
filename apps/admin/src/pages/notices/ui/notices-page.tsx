/** 종류 필터·조회 상태·목록 카드를 조합하며 필터 상태는 라우터가 소유한다. */
import { useHydrated, Link } from '@tanstack/react-router';
import { useNoticesQuery, useNoticeMembersQuery } from '~/features/notice-management';
import type { NoticeCategory } from '../model/notice-search';
import { Plus } from 'lucide-react';
import { ActionButton } from '@yapp-plus/ui';
import { NoticeList } from './notice-list';
import { NoticeListHeader } from './notice-list-header';
import { NoticeCategoryFilter } from './notice-category-filter';
import * as styles from './notices-page.css';

/** 비활성 환경·조회 실패·빈 목록을 구분해 사용자가 현재 상태를 알 수 있게 한다. */
export function NoticesPage({
  category,
  onCategoryChange,
}: {
  category: NoticeCategory;
  onCategoryChange: (category: NoticeCategory) => void;
}) {
  const hydrated = useHydrated();
  const noticesQuery = useNoticesQuery();
  const membersQuery = useNoticeMembersQuery();

  return (
    <main className={styles.page}>
      <NoticeListHeader
        count={hydrated && noticesQuery.isSuccess ? noticesQuery.data.length : undefined}
      />
      <ActionButton asChild variant="neutralSolid" className={styles.createLink}>
        <Link to="/notices/new" search={{}} aria-label="공지 작성">
          <Plus size={17} aria-hidden="true" />
          게시글 작성하기
        </Link>
      </ActionButton>
      <NoticeCategoryFilter category={category} onCategoryChange={onCategoryChange} />
      <NoticeList
        category={category}
        available={import.meta.env.DEV && hydrated}
        noticesQuery={noticesQuery}
        membersQuery={membersQuery}
      />
    </main>
  );
}
