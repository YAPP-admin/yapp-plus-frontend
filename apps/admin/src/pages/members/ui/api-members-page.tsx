import { useInfiniteQuery, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type {
  AdminGenerationListItemResponse,
  AdminMemberItemResponse,
} from '@yapp-plus/api/generated';
import { overlay } from 'overlay-kit';
import { ActionButton, Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import { Link } from '@tanstack/react-router';
import {
  adminGenerationQueryOptions,
  useOptionalAdminGeneration,
} from '~/features/admin-generation';
import { PageHeader } from '~/shared/ui/page-header';
import { getMemberApiErrorMessage } from '../model/member-api';
import { memberListQueryOptions, memberTeamOptionsQueryOptions } from '../model/member-api-queries';
import type { MemberSearch } from '../model/member-search';
import { ApiMemberEditDialog } from './api-member-edit-dialog';
import { ApiMemberFilters } from './api-member-filters';
import { ApiMemberList } from './api-member-list';
import * as styles from './members-page.css';

export function ApiMembersPage({
  search,
  onFilterChange,
  onSearch,
}: {
  search: MemberSearch;
  onSearch: (query: string) => void;
  onFilterChange: (change: Partial<Omit<MemberSearch, 'q' | 'tab'>>) => void;
}) {
  const generationContext = useOptionalAdminGeneration();
  // 공통 컨텍스트가 있으면 선택된 기수를 우선하고, 독립 렌더링이면 기수 API 결과를 fallback으로 사용한다.
  const generationQuery = useSuspenseQuery(adminGenerationQueryOptions());
  const currentGeneration =
    generationContext?.currentGeneration ?? generationQuery.data.generations[0];
  const generations = generationContext?.generations ?? generationQuery.data.generations;
  const snackbar = useSnackbarAdapter();

  if (currentGeneration === undefined) {
    return (
      <main className={styles.page}>
        <PageHeader
          eyebrow="MEMBER MANAGEMENT"
          title="회원 관리"
          description="YAPP 회원 정보와 가입 신청을 관리해요."
        />
        <p className={styles.placeholder}>조회할 기수 정보가 없습니다.</p>
      </main>
    );
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
      <ApiMembersContent
        key={currentGeneration.generationId}
        generationId={currentGeneration.generationId}
        generationNumber={currentGeneration.generationNumber}
        generations={generations}
        search={search}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        onSaved={() => {
          snackbar.create({
            render: () => <Snackbar variant="positive" message="회원 정보를 저장했어요." />,
          });
        }}
      />
    </main>
  );
}

function ApiMembersContent({
  generationId,
  generationNumber,
  generations,
  search,
  onSearch,
  onFilterChange,
  onSaved,
}: {
  generationId: number;
  generationNumber: number;
  generations: readonly AdminGenerationListItemResponse[];
  search: MemberSearch;
  onSearch: (query: string) => void;
  onFilterChange: (change: Partial<Omit<MemberSearch, 'q' | 'tab'>>) => void;
  onSaved: () => void;
}) {
  const listQuery = useInfiniteQuery(memberListQueryOptions(generationId, search));
  const teamQuery = useQuery(memberTeamOptionsQueryOptions(generationId));
  const members = listQuery.data?.pages.flatMap((page) => page.items) ?? [];

  function openMemberEdit(memberId: number) {
    overlay.open(({ unmount }) => (
      <ApiMemberEditDialog
        generationId={generationId}
        generationNumber={generationNumber}
        generations={generations}
        search={search}
        memberId={memberId}
        onClose={unmount}
        onSaved={() => {
          unmount();
          onSaved();
        }}
      />
    ));
  }

  return (
    <>
      <ApiMemberFilters
        search={search}
        teams={teamQuery.data ?? []}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
      />
      {teamQuery.error ? (
        <div className={styles.error} role="alert">
          <span>{getMemberApiErrorMessage(teamQuery.error, 'team')}</span>
          <ActionButton
            type="button"
            variant="neutralWeak"
            loading={teamQuery.isFetching}
            onClick={() => void teamQuery.refetch()}
          >
            다시 시도
          </ActionButton>
        </div>
      ) : null}
      {renderListContent({
        isPending: listQuery.isPending,
        error: listQuery.error,
        isFetching: listQuery.isFetching,
        refetch: listQuery.refetch,
        members,
        generationNumber,
        hasNextPage: listQuery.hasNextPage,
        isFetchingNextPage: listQuery.isFetchingNextPage,
        fetchNextPage: listQuery.fetchNextPage,
        onEdit: openMemberEdit,
      })}
    </>
  );
}

function renderListContent({
  isPending,
  error,
  isFetching,
  refetch,
  members,
  generationNumber,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onEdit,
}: {
  isPending: boolean;
  error: unknown;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
  members: readonly AdminMemberItemResponse[];
  generationNumber: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  onEdit: (memberId: number) => void;
}): ReactNode {
  if (isPending) {
    return <output className={styles.loading}>회원 목록을 불러오는 중입니다.</output>;
  }
  if (error !== null && error !== undefined) {
    return (
      <div className={styles.error} role="alert">
        <span>{getMemberApiErrorMessage(error, 'list')}</span>
        <ActionButton
          type="button"
          variant="neutralWeak"
          loading={isFetching}
          onClick={() => void refetch()}
        >
          다시 시도
        </ActionButton>
      </div>
    );
  }
  return (
    <ApiMemberList
      members={members}
      generationNumber={generationNumber}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onFetchNextPage={() => void fetchNextPage()}
      onEdit={onEdit}
    />
  );
}
