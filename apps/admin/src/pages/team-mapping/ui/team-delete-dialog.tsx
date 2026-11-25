/** 팀 삭제를 재확인하고 삭제 SDK 호출 실패를 다이얼로그 안에서 안내한다. */
import { useState } from 'react';
import { AlertDialog, Portal, ResponsivePair, Text } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { TeamMappingTeam } from '~/features/team-management';

export function TeamDeleteDialog({
  team,
  onClose,
  onDelete,
}: {
  team: TeamMappingTeam;
  onClose: () => void;
  onDelete: () => Promise<void>;
}) {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function deleteTeam() {
    if (isPending) {
      return;
    }
    setIsPending(true);
    setErrorMessage(undefined);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '팀을 삭제하지 못했어요.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog.Root
      role="alertdialog"
      open
      closeOnInteractOutside={false}
      closeOnEscape={!isPending}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Positioner>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>팀을 삭제할까요?</AlertDialog.Title>
              <AlertDialog.Description>“{team.name}” 팀이 삭제됩니다.</AlertDialog.Description>
            </AlertDialog.Header>
            {errorMessage !== undefined && (
              <Text as="p" role="alert" color="fg.critical">
                {errorMessage}
              </Text>
            )}
            <AlertDialog.Footer>
              <ResponsivePair gap="x2">
                <AlertDialog.Action asChild>
                  <ActionButton type="button" variant="neutralWeak" disabled={isPending}>
                    취소
                  </ActionButton>
                </AlertDialog.Action>
                <ActionButton
                  type="button"
                  variant="criticalSolid"
                  disabled={isPending}
                  loading={isPending}
                  onClick={() => void deleteTeam()}
                >
                  삭제
                </ActionButton>
              </ResponsivePair>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Positioner>
      </Portal>
    </AlertDialog.Root>
  );
}
