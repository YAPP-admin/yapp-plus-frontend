/** 삭제 대상과 영향을 확인하고 제출 대기·실패·재시도 동작을 제공합니다. */
import { ActionButton, Dialog, Portal } from '@seed-design/react';
import type { Session } from '../model/session';
import * as styles from './session-delete-dialog.css';

export function SessionDeleteDialog({
  session,
  pending,
  error,
  onClose,
  onConfirm,
  onRefresh,
}: {
  session: Session;
  pending: boolean;
  error: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRefresh: () => void;
}) {
  return (
    <Dialog.Root
      open
      closeOnInteractOutside={false}
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Positioner>
          <Dialog.Backdrop />
          <Dialog.Content
            role="alertdialog"
            data-seed-color-mode="dark-only"
            className={styles.content}
          >
            <Dialog.Header>
              <Dialog.Title>세션을 삭제할까요?</Dialog.Title>
              <Dialog.Description>
                ‘{session.name}’ 세션과 관련 출석 기록이 삭제됩니다. 삭제 후에는 되돌릴 수 없어요.
              </Dialog.Description>
            </Dialog.Header>
            {error && (
              <div className={styles.error}>
                <p role="alert">
                  세션을 삭제하지 못했어요. 다시 시도하거나 목록을 새로고침해 주세요.
                </p>
                <ActionButton variant="neutralWeak" onClick={onRefresh} disabled={pending}>
                  닫고 목록 새로고침
                </ActionButton>
              </div>
            )}
            <Dialog.Footer className={styles.actions}>
              <ActionButton variant="neutralWeak" onClick={onClose} disabled={pending}>
                취소
              </ActionButton>
              <ActionButton
                variant="criticalSolid"
                onClick={onConfirm}
                disabled={pending}
                loading={pending}
              >
                {error ? '다시 삭제' : '삭제'}
              </ActionButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
