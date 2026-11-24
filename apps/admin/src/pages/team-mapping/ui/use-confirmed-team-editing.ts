/** 확정된 팀 매핑의 화면 편집 모드와 종료 보호를 관리한다. */
import { useState } from 'react';
import type { TeamMappingStatus } from '~/features/team-management';
import { useTeamMappingDraft } from './team-mapping-draft-context';
import { useTeamLeaveGuard } from './use-team-leave-guard';

/** 확정 조회에서는 읽기 전용이고, 편집 모드에서만 팀원 배정을 변경할 수 있다. */
export function useConfirmedTeamEditing({ status }: { status: TeamMappingStatus }) {
  const draft = useTeamMappingDraft();
  const [requestedEditing, setRequestedEditing] = useState(false);
  const isEditing = status === 'confirmed' && requestedEditing;
  const { requestLeave } = useTeamLeaveGuard({
    dirty: isEditing && (draft.detailDirty || draft.unassignedDirty),
    onLeave: () => {
      draft.setDetailDirty(false);
      draft.setUnassignedDirty(false);
      setRequestedEditing(false);
    },
  });

  function startEditing() {
    if (status === 'confirmed') {
      setRequestedEditing(true);
    }
  }

  return { isEditing, startEditing, requestExit: requestLeave };
}
