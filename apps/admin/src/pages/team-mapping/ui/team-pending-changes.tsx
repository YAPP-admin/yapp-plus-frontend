/** 팀 상세 패널에서 현재 작업 중인 회원 배정 변경 예정만 표시한다. */
import { ActionButton } from '@yapp-plus/ui';
import {
  getMemberByActivityId,
  getMemberTeamId,
  getTeamById,
  type TeamMappingSnapshot,
  type TeamMemberChange,
} from '~/features/team-management';
import * as styles from './team-detail-panel.css';

type TeamPendingChangesProps = {
  snapshot: TeamMappingSnapshot;
  currentTeamId: string;
  changes: readonly TeamMemberChange[];
  onCancel: (activityId: string) => void;
  onClear: () => void;
};

function getChangeLabel(
  snapshot: TeamMappingSnapshot,
  currentTeamId: string,
  change: TeamMemberChange,
): string {
  if (change.destinationTeamId === null) {
    return '제외 예정';
  }

  const sourceTeamId = getMemberTeamId(snapshot, change.activityId);
  if (sourceTeamId === undefined) {
    return '배정 예정';
  }
  if (sourceTeamId === currentTeamId) {
    return '이동 예정';
  }
  return '추가 예정';
}

function getDestinationLabel(snapshot: TeamMappingSnapshot, change: TeamMemberChange): string {
  if (change.destinationTeamId === null) {
    return '팀에서 제외';
  }

  return getTeamById(snapshot, change.destinationTeamId)?.name ?? '대상 팀 확인 필요';
}

export function TeamPendingChanges({
  snapshot,
  currentTeamId,
  changes,
  onCancel,
  onClear,
}: TeamPendingChangesProps) {
  if (changes.length === 0) {
    return null;
  }

  return (
    <section className={styles.pendingSection} aria-labelledby="team-pending-changes-title">
      <div className={styles.sectionHeader}>
        <h3 id="team-pending-changes-title" className={styles.sectionTitle}>
          변경 예정
        </h3>
        <ActionButton type="button" variant="neutralWeak" size="small" onClick={onClear}>
          전체 취소
        </ActionButton>
      </div>
      <ul className={styles.pendingList}>
        {changes.map((change) => {
          const member = getMemberByActivityId(snapshot, change.activityId);
          if (member === undefined) {
            return null;
          }

          return (
            <li key={change.activityId} className={styles.pendingItem}>
              <div className={styles.pendingText}>
                <span className={styles.pendingName}>{member.name}</span>
                <span className={styles.pendingMeta}>
                  {getChangeLabel(snapshot, currentTeamId, change)} ·{' '}
                  {getDestinationLabel(snapshot, change)}
                </span>
              </div>
              <ActionButton
                type="button"
                variant="neutralWeak"
                size="small"
                aria-label={`${member.name} 변경 예정 취소`}
                onClick={() => onCancel(change.activityId)}
              >
                예정 취소
              </ActionButton>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
