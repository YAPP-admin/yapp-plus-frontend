import { ContentDialog, Portal } from '@seed-design/react';
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
    <ContentDialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <ContentDialog.Backdrop />
        <ContentDialog.Positioner>
          <ContentDialog.Content className={styles.dialog} data-seed-color-mode="dark-only">
            <ContentDialog.Header>
              <ContentDialog.Title>회원 정보 수정</ContentDialog.Title>
              <ContentDialog.Description>
                {member.name} 회원의 정보를 수정해요.
              </ContentDialog.Description>
              <ContentDialog.CloseButton aria-label="닫기">
                <X size={20} aria-hidden="true" />
              </ContentDialog.CloseButton>
            </ContentDialog.Header>
            <ContentDialog.Body>
              <MemberEditForm member={member} activityId={activityId} />
            </ContentDialog.Body>
            <ContentDialog.Footer>
              <ActionButton type="button" variant="neutralWeak" onClick={onClose}>
                취소
              </ActionButton>
            </ContentDialog.Footer>
          </ContentDialog.Content>
        </ContentDialog.Positioner>
      </Portal>
    </ContentDialog.Root>
  );
}
