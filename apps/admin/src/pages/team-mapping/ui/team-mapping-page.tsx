/** 팀 빌딩 전 빈 상태와 원본 팀 목록·필터를 제공한다. 실제 생성·상세는 후속 단계에서 연결한다. */
import { overlay } from 'overlay-kit';
import { ActionButton, ResultSection } from '@yapp-plus/ui';
import { UsersRound } from 'lucide-react';
import {
  getTeamFilterCounts,
  getTeamsForFilter,
  teamMappingStatusSchema,
  type TeamMappingTeam,
  type TeamMappingSnapshot,
  type TeamMappingStatus,
} from '~/features/team-management';
import { FilterSelect } from '~/shared/ui/filter-select';
import { PageHeader } from '~/shared/ui/page-header';
import {
  teamMappingFilterLabels,
  teamMappingPreviewLabels,
  type TeamMappingSearch,
} from '../model/team-search';
import { TeamCard } from './team-card';
import { TeamCreateDialog } from './team-create-dialog';
import { TeamDetailPanel } from './team-detail-panel';
import * as styles from './team-mapping-page.css';
import { TeamFilters } from './team-filters';

/** 화면 상태에 따라 빈 상태 또는 읽기 전용 팀 목록을 표시한다. */
export function TeamMappingPage({
  snapshot,
  search,
  onPreviewChange,
  onFilterChange,
  onTeamSelect,
  onCreateTeam,
}: {
  snapshot: TeamMappingSnapshot;
  search: TeamMappingSearch;
  onPreviewChange: (preview: TeamMappingStatus) => void;
  onFilterChange?: (filter: TeamMappingSearch['filter']) => void;
  onTeamSelect?: (team: TeamMappingTeam) => void;
  onCreateTeam?: () => void;
}) {
  const hasTeams = snapshot.status !== 'before';
  const filterCounts = getTeamFilterCounts(snapshot);
  const teams = getTeamsForFilter(snapshot, search.filter);
  const hasEmptyFilterResult = teams.length === 0;
  const assignedMemberCount = snapshot.teams.reduce(
    (total, team) => total + team.memberActivityIds.length,
    0,
  );

  function openCreateDialog() {
    onCreateTeam?.();
    overlay.open(({ unmount }) => <TeamCreateDialog snapshot={snapshot} onClose={unmount} />);
  }

  function openTeamDetail(team: TeamMappingTeam) {
    onTeamSelect?.(team);
    if (onTeamSelect === undefined) {
      overlay.open(({ unmount }) => (
        <TeamDetailPanel snapshot={snapshot} team={team} onClose={unmount} />
      ));
    }
  }

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="TEAM MAPPING"
        title="팀 매핑"
        description="팀 구성과 회원 배정 현황을 관리해요."
      >
        <div className={styles.headerActions}>
          <FilterSelect
            className={styles.previewField}
            label="화면 상태"
            value={search.preview}
            options={teamMappingStatusSchema.options}
            labels={teamMappingPreviewLabels}
            onChange={onPreviewChange}
          />
          {hasTeams && (
            <TeamFilters
              snapshot={snapshot}
              value={search.filter}
              onChange={(filter) => onFilterChange?.(filter)}
            />
          )}
        </div>
      </PageHeader>

      {snapshot.status === 'before' ? (
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
            description={`${snapshot.generation}기 팀 빌딩을 시작하면 팀원과 서비스를 함께 관리할 수 있어요.`}
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
        <section className={styles.teamListSection} aria-labelledby="team-mapping-list-title">
          <div className={styles.listHeader}>
            <div>
              <h2 id="team-mapping-list-title" className={styles.listTitle}>
                팀 목록
              </h2>
              <p className={styles.listSummary}>
                총 {snapshot.teams.length}팀 · {assignedMemberCount}명 배정 ·{' '}
                {filterCounts.unassigned}명 미배정
              </p>
            </div>
            <ActionButton
              type="button"
              variant="neutralSolid"
              aria-label="팀 만들기"
              onClick={openCreateDialog}
            >
              팀 만들기
            </ActionButton>
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
          {hasEmptyFilterResult ? (
            <section
              className={styles.filterEmpty}
              aria-labelledby="team-mapping-filter-empty-title"
            >
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
          ) : (
            <div className={styles.teamGrid}>
              {teams.map((team) => (
                <TeamCard key={team.id} snapshot={snapshot} team={team} onOpen={openTeamDetail} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
