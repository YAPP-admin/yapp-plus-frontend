/** 배정 중 원본 팀 매핑을 확정하기 전 요약과 비활성 실행을 표시한다. */
import { Dialog, Portal } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { getUnassignedMembers, type TeamMappingSnapshot } from '~/features/team-management';
import * as styles from './team-confirm-dialog.css';

type TeamConfirmDialogProps = {
  snapshot: TeamMappingSnapshot;
  onClose: () => void;
};

/** 원본 기준 집계만 보여 주고 실제 확정 요청은 실행하지 않는다. */
export function TeamConfirmDialog({ snapshot, onClose }: TeamConfirmDialogProps) {
  const assignedMemberCount = snapshot.teams.reduce(
    (total, team) => total + team.memberActivityIds.length,
    0,
  );
  const unassignedMemberCount = getUnassignedMembers(snapshot).length;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={styles.dialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <Dialog.Title>팀을 확정할까요?</Dialog.Title>
              <Dialog.Description>
                현재 원본 팀 구성과 미배정 회원을 확인한 뒤 확정할 수 있어요.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <ul className={styles.summary} aria-label="팀 확정 요약">
                <li className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>팀</span>
                  <span className={styles.summaryValue}>{snapshot.teams.length}팀</span>
                </li>
                <li className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>배정</span>
                  <span className={styles.summaryValue}>{assignedMemberCount}명</span>
                </li>
                <li className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>미배정</span>
                  <span className={styles.summaryValue}>{unassignedMemberCount}명</span>
                </li>
              </ul>
              {unassignedMemberCount > 0 && (
                <p className={styles.warning} role="alert">
                  미배정 회원이 있어요. 확정 전에 배정 상태를 확인해 주세요.
                </p>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <ActionButton type="button" variant="neutralWeak" onClick={onClose}>
                닫기
              </ActionButton>
              <ActionButton
                type="button"
                variant="neutralSolid"
                disabled
                aria-label="팀 확정 (준비 중)"
              >
                팀 확정 (준비 중)
              </ActionButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
