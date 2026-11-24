/** 팀 원본 정보와 현재 패널에서만 유지되는 회원 변경 예정을 제공한다. */
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Portal, SidePanel } from '@seed-design/react';
import { findOptions } from '@yapp-plus/api/generated';
import { ActionButton, Badge } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import {
  getTeamPartCounts,
  teamMappingPartLabels,
  teamMappingPartSchema,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
} from '~/features/team-management';
import { TeamPendingChanges } from './team-pending-changes';
import { TeamMemberList } from './team-member-list';
import { TeamMemberSearchPanel } from './team-member-search-panel';
import * as styles from './team-detail-panel.css';
import { useTeamMappingDraft } from './team-mapping-draft-context';
import { useTeamMemberChanges } from './use-team-member-changes';
import { useTeamMemberSearch } from './use-team-member-search';
import { useTeamLeaveGuard } from './use-team-leave-guard';
import { applyTeamDetailResponse, getTeamApiId } from '../model/team-detail-api';

type TeamDetailPanelProps = {
  snapshot: TeamMappingSnapshot;
  team: TeamMappingTeam;
  generationId?: number;
  onClose: () => void;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function TeamDetailPanel(props: TeamDetailPanelProps) {
  if (props.generationId === undefined) {
    return <TeamDetailPanelContent {...props} />;
  }

  return <ApiTeamDetailPanel {...props} generationId={props.generationId} />;
}

function ApiTeamDetailPanel({
  generationId,
  ...props
}: TeamDetailPanelProps & { generationId: number }) {
  const apiTeamId = getTeamApiId(props.team.id);
  const detailQuery = useQuery({
    ...findOptions({
      path: { generationId, teamId: apiTeamId ?? 0 },
    }),
    enabled: apiTeamId !== undefined,
    refetchOnMount: 'always',
  });

  if (apiTeamId === undefined || detailQuery.isError) {
    return (
      <TeamDetailPanelContent
        {...props}
        detailState="error"
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  if (detailQuery.isPending || detailQuery.data === undefined) {
    return <TeamDetailPanelContent {...props} detailState="loading" />;
  }

  const detail = applyTeamDetailResponse(props.snapshot, props.team, detailQuery.data);
  return <TeamDetailPanelContent {...props} {...detail} />;
}

function TeamDetailPanelContent({
  snapshot,
  team,
  onClose,
  readOnly = false,
  onEdit,
  onDelete,
  detailState = 'ready',
  onRetry,
}: TeamDetailPanelProps & {
  detailState?: 'loading' | 'error' | 'ready';
  onRetry?: () => void;
}) {
  const { setDetailDirty } = useTeamMappingDraft();
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelElement, setPanelElement] = useState<HTMLDivElement | null>(null);
  const counts = getTeamPartCounts(snapshot, team);
  const {
    changes,
    feedback,
    addMember,
    cancelChange,
    clearChanges,
    selectDestination,
    getSelection,
  } = useTeamMemberChanges(snapshot, team, setDetailDirty);
  const { isAddOpen, query, candidates, toggleAdd, setQuery, selectMember } = useTeamMemberSearch({
    snapshot,
    team,
    changes,
    onSelectMember: addMember,
  });
  const { requestLeave } = useTeamLeaveGuard({
    dirty: changes.length > 0,
    onLeave: () => {
      setDetailDirty(false);
      onClose();
    },
  });

  return (
    <SidePanel.Root direction="right" open onOpenChange={(open) => !open && requestLeave()}>
      <Portal>
        <SidePanel.Backdrop />
        <SidePanel.Positioner>
          <SidePanel.Content
            ref={(element) => {
              panelRef.current = element;
              setPanelElement(element);
            }}
            className={styles.panel}
            data-seed-color-mode="dark-only"
          >
            <SidePanel.Header>
              <SidePanel.Title>{team.name}</SidePanel.Title>
              <SidePanel.Description>
                {team.serviceName ?? '서비스명 없음'} · 원본 팀원 {team.memberActivityIds.length}명
              </SidePanel.Description>
              <SidePanel.CloseButton aria-label="닫기">
                <X size={20} aria-hidden="true" />
              </SidePanel.CloseButton>
            </SidePanel.Header>
            <SidePanel.Body className={styles.body}>
              {detailState !== 'ready' && (
                <section
                  className={styles.detailStatus}
                  role={detailState === 'error' ? 'alert' : 'status'}
                  aria-live="polite"
                >
                  {detailState === 'loading' ? (
                    <output>팀 상세 정보를 불러오는 중...</output>
                  ) : (
                    <>
                      <p>팀 상세 정보를 불러오지 못했습니다.</p>
                      <ActionButton type="button" variant="neutralWeak" onClick={onRetry}>
                        다시 시도
                      </ActionButton>
                    </>
                  )}
                </section>
              )}
              {detailState === 'ready' && (
                <>
                  <section className={styles.summary} aria-label="팀 정보">
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>서비스</span>
                      <span className={styles.summaryValue}>
                        {team.serviceName ?? '서비스명 없음'}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>원본 팀원</span>
                      <span className={styles.summaryValue}>{team.memberActivityIds.length}명</span>
                    </div>
                  </section>

                  <section className={styles.section} aria-labelledby="team-detail-parts-title">
                    <h3 id="team-detail-parts-title" className={styles.sectionTitle}>
                      직군 구성
                    </h3>
                    <ul className={styles.partSummary}>
                      {teamMappingPartSchema.options
                        .filter((part) => counts[part] > 0)
                        .map((part) => (
                          <li key={part}>
                            <Badge variant="weak" tone="neutral">
                              {teamMappingPartLabels[part]} {counts[part]}
                            </Badge>
                          </li>
                        ))}
                    </ul>
                  </section>

                  <section className={styles.section} aria-labelledby="team-detail-members-title">
                    <div className={styles.sectionHeader}>
                      <h3 id="team-detail-members-title" className={styles.sectionTitle}>
                        팀원
                      </h3>
                      {!readOnly && (
                        <ActionButton
                          type="button"
                          variant="neutralWeak"
                          size="small"
                          onClick={toggleAdd}
                        >
                          {isAddOpen ? '회원 추가 닫기' : '회원 추가'}
                        </ActionButton>
                      )}
                    </div>
                    {!readOnly && isAddOpen && (
                      <TeamMemberSearchPanel
                        snapshot={snapshot}
                        query={query}
                        candidates={candidates}
                        onQueryChange={setQuery}
                        onSelectMember={selectMember}
                      />
                    )}
                    <TeamMemberList
                      snapshot={snapshot}
                      team={team}
                      panelElement={panelElement}
                      panelRef={panelRef}
                      readOnly={readOnly}
                      getSelection={getSelection}
                      onSelectDestination={selectDestination}
                    />
                    {feedback !== undefined && (
                      <p className={styles.feedback} role="alert">
                        {feedback}
                      </p>
                    )}
                  </section>

                  {!readOnly && (
                    <TeamPendingChanges
                      snapshot={snapshot}
                      currentTeamId={team.id}
                      changes={changes}
                      onCancel={cancelChange}
                      onClear={clearChanges}
                    />
                  )}
                </>
              )}
            </SidePanel.Body>
            <SidePanel.Footer className={styles.footer}>
              {readOnly ? (
                <>
                  <ActionButton type="button" variant="neutralWeak" onClick={onEdit}>
                    수정하기
                  </ActionButton>
                  <ActionButton
                    type="button"
                    variant="neutralWeak"
                    disabled={onDelete === undefined}
                    onClick={onDelete}
                  >
                    삭제하기
                  </ActionButton>
                </>
              ) : (
                <>
                  <ActionButton type="button" variant="neutralWeak" disabled>
                    팀 정보 수정 (준비 중)
                  </ActionButton>
                  <ActionButton type="button" variant="neutralWeak" disabled>
                    팀 삭제 (준비 중)
                  </ActionButton>
                  <ActionButton type="button" variant="neutralSolid" disabled>
                    변경 반영 (준비 중)
                  </ActionButton>
                </>
              )}
            </SidePanel.Footer>
          </SidePanel.Content>
        </SidePanel.Positioner>
      </Portal>
    </SidePanel.Root>
  );
}
