/** 팀 매핑 초안을 잃을 수 있는 종료 요청을 확인한다. */
import { AlertDialog, Portal, ResponsivePair } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';

/** 닫기·페이지 이동에서 같은 이탈 확인 문구와 포커스 관리를 재사용한다. */
export function TeamLeaveDialog({
  open,
  onKeepEditing,
  onDiscard,
}: {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <AlertDialog.Root
      role="alertdialog"
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onKeepEditing();
        }
      }}
      closeOnInteractOutside={false}
    >
      <Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Positioner>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>변경을 버리고 나갈까요?</AlertDialog.Title>
              <AlertDialog.Description>변경한 내용은 저장되지 않습니다.</AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <ResponsivePair gap="x2">
                <AlertDialog.Action asChild>
                  <ActionButton variant="neutralWeak">계속 편집</ActionButton>
                </AlertDialog.Action>
                <ActionButton variant="criticalSolid" onClick={onDiscard}>
                  변경 버리기
                </ActionButton>
              </ResponsivePair>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Positioner>
      </Portal>
    </AlertDialog.Root>
  );
}
