/** 팀 원본 정보와 현재 패널에서만 유지되는 회원 변경 예정을 제공한다. */
import { useRef, useState } from 'react';
import { Portal, SidePanel } from '@seed-design/react';
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

type TeamDetailPanelProps = {
  snapshot: TeamMappingSnapshot;
  team: TeamMappingTeam;
  onClose: () => void;
  readOnly?: boolean;
};

function getMemberAddLabel(readOnly: boolean, isAddOpen: boolean): string {
  if (readOnly) {
    return '회원 추가 (조회 전용)';
  }
  return isAddOpen ? '회원 추가 닫기' : '회원 추가';
}

export function TeamDetailPanel({
  snapshot,
  team,
  onClose,
  readOnly = false,
}: TeamDetailPanelProps) {
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
              <section className={styles.summary} aria-label="팀 정보">
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>서비스</span>
                  <span className={styles.summaryValue}>{team.serviceName ?? '서비스명 없음'}</span>
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
                  <ActionButton
                    type="button"
                    variant="neutralWeak"
                    size="small"
                    disabled={readOnly}
                    onClick={toggleAdd}
                  >
                    {getMemberAddLabel(readOnly, isAddOpen)}
                  </ActionButton>
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

              <TeamPendingChanges
                snapshot={snapshot}
                currentTeamId={team.id}
                changes={changes}
                onCancel={cancelChange}
                onClear={clearChanges}
              />
            </SidePanel.Body>
            <SidePanel.Footer className={styles.footer}>
              <ActionButton type="button" variant="neutralWeak" disabled>
                팀 정보 수정 (준비 중)
              </ActionButton>
              <ActionButton type="button" variant="neutralWeak" disabled>
                팀 삭제 (준비 중)
              </ActionButton>
              <ActionButton type="button" variant="neutralSolid" disabled>
                변경 반영 (준비 중)
              </ActionButton>
            </SidePanel.Footer>
          </SidePanel.Content>
        </SidePanel.Positioner>
      </Portal>
    </SidePanel.Root>
  );
}
