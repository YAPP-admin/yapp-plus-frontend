/** 미배정 회원의 체크와 배정 예정 상태를 관리한다. */
import { useState } from 'react';
import {
  getTeamChangeIssues,
  type TeamMappingMember,
  type TeamMappingSnapshot,
  type TeamMemberChange,
} from '~/features/team-management';

function replaceAssignments(
  changes: readonly TeamMemberChange[],
  activityIds: readonly string[],
  destinationTeamId: string | null,
): readonly TeamMemberChange[] {
  const selectedIds = new Set(activityIds);
  return [
    ...changes.filter((change) => !selectedIds.has(change.activityId)),
    ...(destinationTeamId === null
      ? []
      : activityIds.map((activityId) => ({ activityId, destinationTeamId }))),
  ];
}

/** 체크 해제와 배정 예정 취소를 별도 동작으로 유지한다. */
export function useUnassignedMembers({
  snapshot,
  members,
  onDirtyChange,
  readOnly: readOnlyOverride,
}: {
  snapshot: TeamMappingSnapshot;
  members: readonly TeamMappingMember[];
  onDirtyChange?: (dirty: boolean) => void;
  readOnly?: boolean;
}) {
  const [checkedActivityIds, setCheckedActivityIds] = useState<ReadonlySet<string>>(new Set());
  const [changes, setChanges] = useState<readonly TeamMemberChange[]>([]);
  const [feedback, setFeedback] = useState<string | undefined>();
  const isReadOnly = readOnlyOverride ?? snapshot.status === 'confirmed';
  const pendingByActivityId = new Map(changes.map((change) => [change.activityId, change]));
  const checkedIds = members
    .filter((member) => checkedActivityIds.has(member.activityId))
    .map((member) => member.activityId);

  function updateAssignments(activityIds: readonly string[], destinationTeamId: string | null) {
    if (activityIds.length === 0 || isReadOnly) {
      return;
    }

    const nextChanges = replaceAssignments(changes, activityIds, destinationTeamId);
    const issues = getTeamChangeIssues(snapshot, nextChanges);
    if (issues.length > 0) {
      setFeedback(issues[0]?.message);
      return;
    }

    setChanges(nextChanges);
    onDirtyChange?.(nextChanges.length > 0);
    setFeedback(undefined);
  }

  function toggleChecked(activityId: string, checked: boolean) {
    setCheckedActivityIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(activityId);
      } else {
        next.delete(activityId);
      }
      return next;
    });
  }

  function selectMemberDestination(activityId: string, destinationTeamId: string | null) {
    updateAssignments([activityId], destinationTeamId);
  }

  function cancelAssignment(activityId: string) {
    updateAssignments([activityId], null);
  }

  return {
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
  };
}
