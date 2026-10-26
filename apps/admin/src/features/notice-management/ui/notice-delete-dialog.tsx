/** 공지 제목을 확인한 뒤 삭제하고 실패 시 같은 창에서 재시도한다. */
import { useState } from 'react';
import { Dialog, Portal, ResponsivePair, Text } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { Notice } from '../model/notice';
import { useNoticeMutations } from '../model/notice-queries';

/** 창 열림은 화면이 소유하고 취소 포커스는 SEED에 맡긴다. */
export function NoticeDeleteDialog({ notice }: { notice: Notice }) {
  const [open, setOpen] = useState(false);
  const { remove } = useNoticeMutations();

  /** 실패하면 mutation 오류를 표시하고 확인 창에서 다시 요청한다. */
  function deleteNotice() {
    if (!remove.isPending) {
      remove.mutate(notice.id, { onSuccess: () => setOpen(false) });
    }
  }

  return (
    <Dialog.Root
      role="alertdialog"
      open={open}
      onOpenChange={(next) => {
        if (remove.isPending) {
          return;
        }
        remove.reset();
        setOpen(next);
      }}
      closeOnInteractOutside={false}
      closeOnEscape={!remove.isPending}
    >
      <Dialog.Trigger asChild>
        <ActionButton variant="ghost" size="small">
          삭제
        </ActionButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>공지를 삭제할까요?</Dialog.Title>
              <Dialog.Description>“{notice.title}” 공지가 삭제됩니다.</Dialog.Description>
            </Dialog.Header>
            {remove.isError && (
              <Text as="p" role="alert" color="fg.critical">
                삭제하지 못했습니다. 다시 시도해 주세요.
              </Text>
            )}
            <Dialog.Footer>
              <ResponsivePair gap="x2">
                <Dialog.Action asChild>
                  <ActionButton variant="neutralWeak" disabled={remove.isPending}>
                    취소
                  </ActionButton>
                </Dialog.Action>
                <ActionButton
                  variant="criticalSolid"
                  disabled={remove.isPending}
                  loading={remove.isPending}
                  onClick={deleteNotice}
                >
                  삭제
                </ActionButton>
              </ResponsivePair>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
