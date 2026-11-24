/** 팀 빌딩 전·배정 중 상태의 원본 목록과 편집 진입을 제공한다. */
import { useState } from 'react';
import { overlay } from 'overlay-kit';
import { ActionButton, ResultSection } from '@yapp-plus/ui';
import { UsersRound } from 'lucide-react';
import {
  getMemberByActivityId,
  getTeamFilterCounts,
  getTeamsForFilter,
  teamMappingSnapshotSchema,
  type TeamDraftValues,
  type TeamMappingTeam,
  type TeamMappingSnapshot,
} from '~/features/team-management';
import { PageHeader } from '~/shared/ui/page-header';
import { teamMappingFilterLabels, type TeamMappingSearch } from '../model/team-search';
import { TeamCard } from './team-card';
import { TeamCreateDialog } from './team-create-dialog';
import { TeamDetailPanel } from './team-detail-panel';
import * as styles from './team-mapping-page.css';
import { TeamFilters } from './team-filters';
import { UnassignedMembers } from './unassigned-members';
import { TeamMappingDraftContext, useTeamMappingDraft } from './team-mapping-draft-context';

function getTeamLeaderActivityId(
  snapshot: TeamMappingSnapshot,
  memberActivityIds: readonly string[],
  preferredActivityId: string | null,
): string | null {
  if (
    preferredActivityId !== null &&
    memberActivityIds.includes(preferredActivityId) &&
    getMemberByActivityId(snapshot, preferredActivityId)?.part === 'pm'
  ) {
    return preferredActivityId;
  }

  return (
    memberActivityIds.find(
      (activityId) => getMemberByActivityId(snapshot, activityId)?.part === 'pm',
    ) ??
    memberActivityIds[0] ??
    null
  );
}

function updateTeamSnapshot(
  snapshot: TeamMappingSnapshot,
  team: TeamMappingTeam,
  values: TeamDraftValues,
  destinationTeamIds: Readonly<Record<string, string>> = {},
): TeamMappingSnapshot {
  const selectedActivityIds = new Set(values.memberActivityIds);
  const destinationEntries = Object.entries(destinationTeamIds);
  const movedActivityIds = new Set(destinationEntries.map(([activityId]) => activityId));
  const teams = snapshot.teams.map((candidate) => {
    const memberActivityIds =
      candidate.id === team.id
        ? [...values.memberActivityIds]
        : candidate.memberActivityIds.filter(
            (activityId) =>
              !selectedActivityIds.has(activityId) && !movedActivityIds.has(activityId),
          );

    destinationEntries.forEach(([activityId, destinationTeamId]) => {
      if (candidate.id === destinationTeamId && !memberActivityIds.includes(activityId)) {
        memberActivityIds.push(activityId);
      }
    });

    return {
      ...candidate,
      name: candidate.id === team.id ? values.name.trim() : candidate.name,
      serviceName:
        candidate.id === team.id ? values.serviceName.trim() || null : candidate.serviceName,
      memberActivityIds,
      leaderActivityId: getTeamLeaderActivityId(
        snapshot,
        memberActivityIds,
        candidate.leaderActivityId,
      ),
    };
  });

  return teamMappingSnapshotSchema.parse({ ...snapshot, teams });
}

/** snapshot 상태에 따라 빈 상태 또는 팀 목록을 표시한다. */
export function TeamMappingPage({
  snapshot,
  search,
  onFilterChange,
  onTeamSelect,
  onCreateTeam,
}: {
  snapshot: TeamMappingSnapshot;
  search: TeamMappingSearch;
  onFilterChange?: (filter: TeamMappingSearch['filter']) => void;
  onTeamSelect?: (team: TeamMappingTeam) => void;
  onCreateTeam?: () => void;
}) {
  const draft = useTeamMappingDraft();
  const [workingSnapshot, setWorkingSnapshot] = useState(snapshot);
  const hasTeams = workingSnapshot.status !== 'before';
  const filterCounts = getTeamFilterCounts(workingSnapshot);
  const teams = getTeamsForFilter(workingSnapshot, search.filter);
  const hasEmptyFilterResult = teams.length === 0;
  const assignedMemberCount = workingSnapshot.teams.reduce(
    (total, team) => total + team.memberActivityIds.length,
    0,
  );

  function openCreateDialog() {
    onCreateTeam?.();
    overlay.open(({ unmount }) => (
      <TeamMappingDraftContext.Provider value={draft}>
        <TeamCreateDialog snapshot={workingSnapshot} onClose={unmount} />
      </TeamMappingDraftContext.Provider>
    ));
  }

  function openEditDialog(team: TeamMappingTeam) {
    overlay.open(({ unmount }) => (
      <TeamMappingDraftContext.Provider value={draft}>
        <TeamCreateDialog
          snapshot={workingSnapshot}
          team={team}
          onClose={unmount}
          onUpdate={(editingTeam, values, destinationTeamIds) => {
            setWorkingSnapshot((currentSnapshot) =>
              updateTeamSnapshot(currentSnapshot, editingTeam, values, destinationTeamIds),
            );
          }}
        />
      </TeamMappingDraftContext.Provider>
    ));
  }

  function openTeamDetail(team: TeamMappingTeam) {
    onTeamSelect?.(team);
    if (onTeamSelect === undefined) {
      overlay.open(({ unmount }) => (
        <TeamMappingDraftContext.Provider value={draft}>
          <TeamDetailPanel
            snapshot={workingSnapshot}
            team={team}
            onClose={unmount}
            readOnly
            onEdit={() => {
              unmount();
              openEditDialog(team);
            }}
          />
        </TeamMappingDraftContext.Provider>
      ));
    }
  }

  function renderTeamContent() {
    if (search.filter === 'unassigned') {
      return <UnassignedMembers snapshot={workingSnapshot} />;
    }

    if (hasEmptyFilterResult) {
      return (
        <section className={styles.filterEmpty} aria-labelledby="team-mapping-filter-empty-title">
          <ResultSection
            size="medium"
            titleAs="h3"
            title={
              <span id="team-mapping-filter-empty-title">
                {teamMappingFilterLabels[search.filter]} 팀이 없어요
              </span>
            }
            description="다른 필터를 선택해 팀 목록을 확인해 보세요."
          />
        </section>
      );
    }

    return (
      <div className={styles.teamGrid}>
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            snapshot={workingSnapshot}
            team={team}
            onOpen={openTeamDetail}
            onEdit={openEditDialog}
          />
        ))}
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="TEAM MAPPING"
        title="팀 매핑"
        description="팀 구성과 회원 배정 현황을 관리해요."
      >
        <div className={styles.headerActions}>
          {hasTeams && (
            <TeamFilters
              snapshot={workingSnapshot}
              value={search.filter}
              onChange={(filter) => onFilterChange?.(filter)}
            />
          )}
        </div>
      </PageHeader>

      {workingSnapshot.status === 'before' ? (
        <section className={styles.emptyState} aria-labelledby="team-mapping-empty-title">
          <ResultSection
            size="medium"
            asset={
              <span className={styles.emptyIcon} aria-hidden="true">
                <UsersRound size={24} />
              </span>
            }
            titleAs="h2"
            title={<span id="team-mapping-empty-title">아직 만들어진 팀이 없어요</span>}
            description={`${workingSnapshot.generation}기 팀 빌딩을 시작하면 팀원과 서비스를 함께 관리할 수 있어요.`}
            primaryActionProps={{
              type: 'button',
              variant: 'neutralSolid',
              'aria-label': '첫 팀 만들기',
              onClick: openCreateDialog,
              children: '첫 팀 만들기',
            }}
          />
        </section>
      ) : (
        <>
          <section className={styles.teamListSection} aria-labelledby="team-mapping-list-title">
            <div className={styles.listHeader}>
              <div>
                <h2 id="team-mapping-list-title" className={styles.listTitle}>
                  팀 목록
                </h2>
                <p className={styles.listSummary}>
                  총 {workingSnapshot.teams.length}팀 · {assignedMemberCount}명 배정 ·{' '}
                  {filterCounts.unassigned}명 미배정
                </p>
              </div>
              <div className={styles.listActions}>
                <ActionButton
                  type="button"
                  variant="neutralSolid"
                  aria-label="팀 만들기"
                  onClick={openCreateDialog}
                >
                  팀 만들기
                </ActionButton>
              </div>
            </div>
            {search.filter === 'unassigned' && (
              <section className={styles.unassignedSummary} aria-label="미배정 회원 요약">
                <h3 className={styles.unassignedSummaryTitle}>
                  미배정 회원 {filterCounts.unassigned}명
                </h3>
                <p className={styles.unassignedSummaryDescription}>
                  아직 팀에 배정되지 않은 회원이 있어요.
                </p>
              </section>
            )}
            {renderTeamContent()}
          </section>
        </>
      )}
    </main>
  );
}
