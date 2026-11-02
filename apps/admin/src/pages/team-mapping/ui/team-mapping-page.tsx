/** 팀 빌딩 전 진입 화면과 preview 전환을 제공한다. 실제 생성은 후속 단계에서 연결한다. */
import { ActionButton, ResultSection } from '@yapp-plus/ui';
import { UsersRound } from 'lucide-react';
import {
  teamMappingStatusSchema,
  type TeamMappingSnapshot,
  type TeamMappingStatus,
} from '~/features/team-management';
import { FilterSelect } from '~/shared/ui/filter-select';
import { PageHeader } from '~/shared/ui/page-header';
import { teamMappingPreviewLabels, type TeamMappingSearch } from '../model/team-search';
import * as styles from './team-mapping-page.css';

export function TeamMappingPage({
  snapshot,
  search,
  onPreviewChange,
  onCreateTeam,
}: {
  snapshot: TeamMappingSnapshot;
  search: TeamMappingSearch;
  onPreviewChange: (preview: TeamMappingStatus) => void;
  onCreateTeam?: () => void;
}) {
  const canCreateTeam = onCreateTeam !== undefined;

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="TEAM MAPPING"
        title="팀 매핑"
        description="팀 구성과 회원 배정 현황을 관리해요."
      >
        <FilterSelect
          className={styles.previewField}
          label="화면 상태"
          value={search.preview}
          options={teamMappingStatusSchema.options}
          labels={teamMappingPreviewLabels}
          onChange={onPreviewChange}
        />
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
              disabled: !canCreateTeam,
              'aria-label': canCreateTeam ? '첫 팀 만들기' : '첫 팀 만들기 (다음 단계에서 연결)',
              onClick: onCreateTeam,
              children: '첫 팀 만들기',
            }}
          />
        </section>
      ) : (
        <section className={styles.emptyState} aria-labelledby="team-mapping-preview-title">
          <h2 id="team-mapping-preview-title" className={styles.emptyTitle}>
            {teamMappingPreviewLabels[snapshot.status]} 화면
          </h2>
          <p className={styles.emptyDescription}>
            팀 목록과 배정 현황은 다음 단계에서 연결합니다. 현재 상태는 원본 fixture로 유지됩니다.
          </p>
        </section>
      )}

      <div className={styles.footerAction}>
        <ActionButton
          type="button"
          variant="neutralWeak"
          disabled={!canCreateTeam}
          aria-label={canCreateTeam ? '팀 만들기' : '팀 만들기 (다음 단계에서 연결)'}
          onClick={onCreateTeam}
        >
          팀 만들기
        </ActionButton>
      </div>
    </main>
  );
}
