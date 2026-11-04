/** 팀 상세 패널에서 회원 배정 변경 예정과 검증 피드백을 관리한다. */
import { useState } from 'react';
import {
  getTeamChangeIssues,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
  type TeamMemberChange,
} from '~/features/team-management';

/** SEED Select에서 사용하는 회원 변경 상태 값이다. */
export const teamMemberChangeSelectValues = {
  none: '__none__',
  exclude: '__exclude__',
} as const;

type UseTeamMemberChangesResult = {
  changes: readonly TeamMemberChange[];
  feedback: string | undefined;
  pendingByActivityId: Map<string, TeamMemberChange>;
  addMember: (activityId: string) => void;
  cancelChange: (activityId: string) => void;
  clearChanges: () => void;
  selectDestination: (activityId: string, value: string) => void;
  getSelection: (activityId: string) => { value: string; label: string };
};

/** 패널의 회원 추가·이동·제외·취소 명령과 Select 표시 상태를 제공한다. */
export function useTeamMemberChanges(
  snapshot: TeamMappingSnapshot,
  team: TeamMappingTeam,
  onDirtyChange?: (dirty: boolean) => void,
): UseTeamMemberChangesResult {
  const [changes, setChanges] = useState<readonly TeamMemberChange[]>([]);
  const [feedback, setFeedback] = useState<string | undefined>();
  const pendingByActivityId = new Map(changes.map((change) => [change.activityId, change]));

  function updateChange(activityId: string, destinationTeamId: string | null) {
    const nextChanges = [
      ...changes.filter((change) => change.activityId !== activityId),
      { activityId, destinationTeamId },
    ];
    const issues = getTeamChangeIssues(snapshot, nextChanges);
    if (issues.length > 0) {
      setFeedback(issues[0]?.message);
      return;
    }

    setChanges(nextChanges);
    onDirtyChange?.(nextChanges.length > 0);
    setFeedback(undefined);
  }

  function cancelChange(activityId: string) {
    const nextChanges = changes.filter((change) => change.activityId !== activityId);
    setChanges(nextChanges);
    onDirtyChange?.(nextChanges.length > 0);
    setFeedback(undefined);
  }

  function addMember(activityId: string) {
    updateChange(activityId, team.id);
  }

  function clearChanges() {
    setChanges([]);
    onDirtyChange?.(false);
    setFeedback(undefined);
  }

  function selectDestination(activityId: string, value: string) {
    if (value === teamMemberChangeSelectValues.none) {
      cancelChange(activityId);
      return;
    }

    updateChange(activityId, value === teamMemberChangeSelectValues.exclude ? null : value);
  }

  function getSelection(activityId: string) {
    const change = pendingByActivityId.get(activityId);
    const value =
      change === undefined
        ? teamMemberChangeSelectValues.none
        : (change.destinationTeamId ?? teamMemberChangeSelectValues.exclude);

    if (value === teamMemberChangeSelectValues.exclude) {
      return { value, label: '팀에서 제외' };
    }
    if (value === teamMemberChangeSelectValues.none) {
      return { value, label: '변경 없음' };
    }

    return {
      value,
      label:
        snapshot.teams.find((candidateTeam) => candidateTeam.id === value)?.name ??
        '대상 팀 확인 필요',
    };
  }

  return {
    changes,
    feedback,
    pendingByActivityId,
    addMember,
    cancelChange,
    clearChanges,
    selectDestination,
    getSelection,
  };
}
