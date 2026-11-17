/** 세션 이름과 삭제 영향을 확인하고, 실패하면 공개 오류만 안내한다. */
import { useCallback, useRef, useState } from 'react';
import { AlertDialog, Portal, ResponsivePair, Text } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { SessionViewModel } from '../model/session-api-model';
import { toSessionOperationFailure } from '../model/session-error';
import { useDeleteSessionMutation } from '../model/session-queries';

type Props = {
  generationId: number;
  session: SessionViewModel;
  onClose: () => void;
  onDeleted: () => void;
  onMissing: () => void;
};

function getDeleteFailureMessage(code: string) {
  switch (code) {
    case 'SESSION_DELETE_CONFLICT':
      return '출석이 시작된 세션은 삭제할 수 없습니다. 최신 상태를 확인해 주세요.';
    case 'UNAUTHORIZED':
      return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
    default:
      return '세션을 삭제하지 못했습니다. 다시 시도해 주세요.';
  }
}

export function SessionDeleteDialog({
  generationId,
  session,
  onClose,
  onDeleted,
  onMissing,
}: Props) {
  const remove = useDeleteSessionMutation(generationId);
  const [failureMessage, setFailureMessage] = useState<string>();
  const cancelFocusScheduled = useRef(false);
  const focusCancelButton = useCallback((button: HTMLButtonElement | null) => {
    if (!button || cancelFocusScheduled.current) {
      return;
    }
    cancelFocusScheduled.current = true;
    queueMicrotask(() => {
      if (button.isConnected) {
        button.focus();
      }
    });
  }, []);

  function deleteSession() {
    if (remove.isPending) {
      return;
    }

    setFailureMessage(undefined);
    remove.mutate(
      { path: { generationId, sessionId: session.id } },
      {
        onSuccess: onDeleted,
        onError: (error) => {
          const { code } = toSessionOperationFailure(error, 'delete');
          if (code === 'SESSION_NOT_FOUND') {
            onMissing();
            return;
          }
          setFailureMessage(getDeleteFailureMessage(code));
        },
      },
    );
  }

  return (
    <AlertDialog.Root
      role="alertdialog"
      open
      onOpenChange={(open) => {
        if (!open && !remove.isPending) {
          onClose();
        }
      }}
      closeOnInteractOutside={false}
      closeOnEscape={!remove.isPending}
    >
      <Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Positioner>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>세션을 삭제할까요?</AlertDialog.Title>
              <AlertDialog.Description>“{session.name}” 세션이 삭제됩니다.</AlertDialog.Description>
            </AlertDialog.Header>
            {failureMessage ? (
              <Text as="p" role="alert" color="fg.critical">
                {failureMessage}
              </Text>
            ) : null}
            <AlertDialog.Footer>
              <ResponsivePair gap="x2">
                <AlertDialog.Action asChild>
                  <ActionButton
                    ref={focusCancelButton}
                    type="button"
                    variant="neutralWeak"
                    disabled={remove.isPending}
                    onClick={onClose}
                  >
                    취소
                  </ActionButton>
                </AlertDialog.Action>
                <ActionButton
                  type="button"
                  variant="criticalSolid"
                  disabled={remove.isPending}
                  loading={remove.isPending}
                  onClick={deleteSession}
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
