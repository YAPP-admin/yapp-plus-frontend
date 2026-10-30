import type { Member } from '~/features/member-management';
import { MemberList } from './member-list';
import { PageHeader } from '~/shared/ui/page-header';
import { MemberFilters } from './member-filters';
import { filterMembers } from '../model/member-list';
import { Link } from '@tanstack/react-router';
import { type MemberSearch } from '../model/member-search';
import { PendingMembers } from './pending-members';
import * as styles from './members-page.css';

export function MembersPage({
  search,
  members,
  currentGeneration,
  onFilterChange,
  onSearch,
}: {
  search: MemberSearch;
  members?: readonly Member[];
  currentGeneration?: number;
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
      <MemberFilters search={search} onSearch={onSearch} onFilterChange={onFilterChange} />
      {members !== undefined && currentGeneration !== undefined ? (
        <MemberList
          members={filterMembers(members, currentGeneration, search)}
          currentGeneration={currentGeneration}
          hasMembers={members.some((member) =>
            member.activities.some((activity) => activity.generation === currentGeneration),
          )}
        />
      ) : (
        <p className={styles.placeholder}>회원 목록을 준비 중입니다.</p>
      )}
    </main>
  );
}
