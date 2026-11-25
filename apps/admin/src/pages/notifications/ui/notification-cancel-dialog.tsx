import { AlertDialog, Portal, ResponsivePair } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';

export type NotificationCancelDialogProps = {
  notificationId: number | undefined;
  onClose: () => void;
  onConfirm: (notificationId: number) => void;
  isPending?: boolean;
};

export function NotificationCancelDialog({
  notificationId,
  onClose,
  onConfirm,
  isPending = false,
}: NotificationCancelDialogProps) {
  return (
    <AlertDialog.Root
      role="alertdialog"
      open={notificationId !== undefined}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
      closeOnInteractOutside={false}
      closeOnEscape={!isPending}
    >
      <Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Positioner>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>예약 알림을 취소할까요?</AlertDialog.Title>
              <AlertDialog.Description>
                예약된 알림은 발송되지 않도록 취소됩니다.
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <ResponsivePair gap="x2">
                <AlertDialog.Action asChild>
                  <ActionButton variant="neutralWeak" disabled={isPending}>
                    닫기
                  </ActionButton>
                </AlertDialog.Action>
                <ActionButton
                  variant="criticalSolid"
                  disabled={isPending || notificationId === undefined}
                  loading={isPending}
                  onClick={() => {
                    if (notificationId !== undefined) {
                      onConfirm(notificationId);
                    }
                  }}
                >
                  예약 취소
                </ActionButton>
              </ResponsivePair>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Positioner>
      </Portal>
    </AlertDialog.Root>
  );
}
