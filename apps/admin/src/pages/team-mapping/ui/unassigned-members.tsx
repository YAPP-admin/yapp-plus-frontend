/** 미배정 회원 목록의 빈 상태·일괄 작업·회원 행을 조합한다. */
import { getUnassignedMembers, type TeamMappingSnapshot } from '~/features/team-management';
import { UnassignedMemberRow } from './unassigned-member-row';
import { UnassignedTeamSelect } from './unassigned-team-select';
import { useUnassignedMembers } from './use-unassigned-members';
import { useTeamMappingDraft } from './team-mapping-draft-context';
import * as styles from './unassigned-members.css';

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className={styles.empty} aria-label="미배정 회원 목록">
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDescription}>{description}</p>
    </section>
  );
}

/** 미배정 회원 영역은 하위 상태 훅과 행 컴포넌트를 조합한다. */
export function UnassignedMembers({
  snapshot,
  readOnly,
}: {
  snapshot: TeamMappingSnapshot;
  readOnly?: boolean;
}) {
  const { setUnassignedDirty } = useTeamMappingDraft();
  const members = getUnassignedMembers(snapshot);
  const {
    checkedActivityIds,
    checkedIds,
    changes,
    feedback,
    isReadOnly,
    pendingByActivityId,
    cancelAssignment,
    selectMemberDestination,
    toggleChecked,
    updateAssignments,
  } = useUnassignedMembers({
    snapshot,
    members,
    readOnly,
    onDirtyChange: setUnassignedDirty,
  });

  if (members.length === 0) {
    return (
      <EmptyState
        title="미배정 회원이 없어요"
        description="모든 후보 회원이 팀에 배정되어 있어요."
      />
    );
  }

  if (snapshot.teams.length === 0) {
    return (
      <EmptyState
        title="배정할 팀이 없어요"
        description="팀을 먼저 만든 뒤 회원을 배정할 수 있어요."
      />
    );
  }

  return (
    <section className={styles.root} aria-labelledby="unassigned-members-title">
      <div className={styles.toolbar}>
        <p id="unassigned-members-title" className={styles.selectionCount}>
          {checkedIds.length}명 선택 · {changes.length}명 배정 예정
        </p>
        <UnassignedTeamSelect
          snapshot={snapshot}
          label="선택 회원 일괄 배정"
          ariaLabel="일괄 대상 팀"
          disabled={isReadOnly || checkedIds.length === 0}
          bulk
          onChange={(destinationTeamId) => updateAssignments(checkedIds, destinationTeamId)}
        />
      </div>

      <ul className={styles.list} aria-label="미배정 회원">
        {members.map((member) => (
          <UnassignedMemberRow
            key={member.activityId}
            snapshot={snapshot}
            member={member}
            change={pendingByActivityId.get(member.activityId)}
            checked={checkedActivityIds.has(member.activityId)}
            disabled={isReadOnly}
            onCheckedChange={(checked) => toggleChecked(member.activityId, checked)}
            onDestinationChange={(destinationTeamId) =>
              selectMemberDestination(member.activityId, destinationTeamId)
            }
            onCancel={() => cancelAssignment(member.activityId)}
          />
        ))}
      </ul>
      {feedback !== undefined && (
        <p className={styles.feedback} role="alert">
          {feedback}
        </p>
      )}
    </section>
  );
}
