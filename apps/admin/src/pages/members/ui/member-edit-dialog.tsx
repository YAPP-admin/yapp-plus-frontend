import { Dialog, Portal } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { X } from 'lucide-react';
import type { Member } from '~/features/member-management';
import { MemberEditForm } from './member-edit-form';
import * as styles from './member-edit-dialog.css';

export function MemberEditDialog({
  member,
  activityId,
  onClose,
}: {
  member: Member;
  activityId: string;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className={styles.dialog} data-seed-color-mode="dark-only">
            <Dialog.Header>
              <Dialog.Title>회원 정보 수정</Dialog.Title>
              <Dialog.Description>{member.name} 회원의 정보를 수정해요.</Dialog.Description>
              <Dialog.CloseButton aria-label="닫기">
                <X size={20} aria-hidden="true" />
              </Dialog.CloseButton>
            </Dialog.Header>
            <Dialog.Body>
              <MemberEditForm member={member} activityId={activityId} />
            </Dialog.Body>
            <Dialog.Footer>
              <ActionButton type="button" variant="neutralWeak" onClick={onClose}>
                취소
              </ActionButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
