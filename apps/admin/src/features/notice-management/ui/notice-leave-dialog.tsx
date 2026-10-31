/** 미저장 초안의 앱 이동·뒤로가기와 브라우저 이탈을 확인한다. */
import { AlertDialog, Portal, ResponsivePair } from '@seed-design/react';
import { useBlocker } from '@tanstack/react-router';
import { ActionButton } from '@yapp-plus/ui';

/** 이동 목적지는 Router가 보관하고 확인 창의 포커스는 SEED가 관리한다. */
export function NoticeLeaveDialog({ dirty }: { dirty: boolean }) {
  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    enableBeforeUnload: dirty,
    withResolver: true,
  });

  return (
    <AlertDialog.Root
      role="alertdialog"
      open={blocker.status === 'blocked'}
      onOpenChange={(open) => {
        if (!open) {
          blocker.reset?.();
        }
      }}
      closeOnInteractOutside={false}
    >
      <Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Positioner>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>저장하지 않고 나갈까요?</AlertDialog.Title>
              <AlertDialog.Description>변경한 내용은 저장되지 않습니다.</AlertDialog.Description>
            </AlertDialog.Header>

            <AlertDialog.Footer>
              <ResponsivePair gap="x2">
                <AlertDialog.Action asChild>
                  <ActionButton variant="neutralWeak">계속 작성</ActionButton>
                </AlertDialog.Action>
                <ActionButton variant="criticalSolid" onClick={blocker.proceed}>
                  나가기
                </ActionButton>
              </ResponsivePair>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Positioner>
      </Portal>
    </AlertDialog.Root>
  );
}
