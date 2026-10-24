/** 종류 필터·조회 상태·목록 카드를 조합하며 필터 상태는 라우터가 소유한다. */
import { useHydrated, Link } from '@tanstack/react-router';
import { RadioGroup } from '@seed-design/react/primitive';
import { useNoticesQuery, useNoticeMembersQuery } from '~/features/notice-management';
import {
  noticeCategoryLabels,
  noticeCategorySchema,
  type NoticeCategory,
} from '../model/notice-search';
import { Plus } from 'lucide-react';
import { ActionButton } from '@yapp-plus/ui';
import { NoticeList } from './notice-list';
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

/** 조회된 전체 게시 개수를 목록 제목과 함께 표시한다. */
function NoticeListHeader({ count }: { count: number | undefined }) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>NOTICE MANAGEMENT</p>
        <h1 className={styles.title}>공지 목록</h1>
        <p className={styles.description}>회원에게 전달한 공지와 확인 현황을 관리합니다.</p>
      </div>
      {count !== undefined && (
        <p className={styles.total}>
          게시 중 <strong>{count}</strong>개
        </p>
      )}
    </header>
  );
}

/** URL의 공지 종류를 라디오 선택과 동기화한다. */
function NoticeCategoryFilter({
  category,
  onCategoryChange,
}: {
  category: NoticeCategory;
  onCategoryChange: (category: NoticeCategory) => void;
}) {
  return (
    <RadioGroup.Root
      className={styles.filter}
      aria-label="공지 종류"
      value={category}
      onValueChange={(value) => onCategoryChange(noticeCategorySchema.parse(value))}
    >
      {noticeCategorySchema.options.map((value) => (
        <RadioGroup.Item key={value} value={value} className={styles.filterItem}>
          {noticeCategoryLabels[value]}
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
