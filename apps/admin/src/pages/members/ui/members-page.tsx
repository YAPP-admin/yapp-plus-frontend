import { PageHeader } from '~/shared/ui/page-header';
import { FilterSelect } from '~/shared/ui/filter-select';
import { Link } from '@tanstack/react-router';
import { memberPartSchema, partLabels, type MemberSearch } from '../model/member-search';
import { ActionButton } from '@yapp-plus/ui';
import { PendingMembers } from './pending-members';
import * as styles from './members-page.css';

export function MembersPage({
  search,
  onFilterChange,
  onSearch,
}: {
  search: MemberSearch;
  onSearch: (query: string) => void;
  onFilterChange: (change: Partial<Omit<MemberSearch, 'q' | 'tab'>>) => void;
}) {
  if (search.tab === 'pending') {
    return <PendingMembers />;
  }
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="MEMBER MANAGEMENT"
        title="회원 관리"
        description="YAPP 회원 정보와 가입 신청을 관리해요."
      >
        <Link className={styles.tab} to="/members/import" search={{}}>
          명단 업로드
        </Link>
      </PageHeader>
      <div className={styles.filters}>
        <form
          key={JSON.stringify(search)}
          className={styles.searchForm}
          onSubmit={(event) => {
            event.preventDefault();

            const query = new FormData(event.currentTarget).get('q');
            if (typeof query === 'string') {
              onSearch(query);
            }
          }}
        >
          <label className={styles.field}>
            이름 검색
            <input
              className={styles.control}
              type="search"
              name="q"
              autoComplete="off"
              defaultValue={search.q}
            />
          </label>
          <ActionButton className={styles.searchButton} type="submit">
            검색
          </ActionButton>
        </form>
        <FilterSelect
          label="직군"
          value={search.part}
          options={memberPartSchema.options}
          labels={partLabels}
          onChange={(part) => onFilterChange({ part })}
        />
      </div>
      <p className={styles.placeholder}>회원 목록을 준비 중입니다.</p>
    </main>
  );
}
