/** 공지 제목을 확인한 뒤 삭제하고 실패 시 같은 창에서 재시도한다. */
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AlertDialog, Portal, ResponsivePair, Text } from '@seed-design/react';
import { ActionButton, Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import type { AdminPostListItemResponse } from '@yapp-plus/api/generated';
import { ApiError } from '@yapp-plus/api';
import { useAdminNoticeMutations } from '../model/notice-queries';

/** 창 열림은 화면이 소유하고 취소 포커스는 SEED에 맡긴다. */
export function NoticeDeleteDialog({
  notice,
  generationId,
}: {
  notice: AdminPostListItemResponse;
  generationId: number;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const snackbar = useSnackbarAdapter();
  const { remove } = useAdminNoticeMutations(generationId);

  /** 실패하면 mutation 오류를 표시하고 확인 창에서 다시 요청한다. */
  function deleteNotice() {
    if (!remove.isPending) {
      remove.mutate(
        { path: { generationId, postId: notice.postId } },
        {
          onSuccess: () => {
            setOpen(false);
            snackbar.create({
              render: () => <Snackbar variant="positive" message="공지를 삭제했습니다." />,
            });
            void navigate({ to: '/notices', search: {} });
          },
          onError: (error) => {
            if (error instanceof ApiError && error.status === 404) {
              snackbar.create({
                render: () => <Snackbar variant="critical" message="존재하지 않는 공지입니다." />,
              });
              setOpen(false);
              void navigate({ to: '/notices', search: {} });
            }
          },
        },
      );
    }
  }

  return (
    <AlertDialog.Root
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
      <AlertDialog.Trigger asChild>
        <ActionButton variant="ghost" size="small">
          삭제
        </ActionButton>
      </AlertDialog.Trigger>
      <Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Positioner>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>공지를 삭제할까요?</AlertDialog.Title>
              <AlertDialog.Description>“{notice.title}” 공지가 삭제됩니다.</AlertDialog.Description>
            </AlertDialog.Header>
            {remove.isError && (
              <Text as="p" role="alert" color="fg.critical">
                삭제하지 못했습니다. 다시 시도해 주세요.
              </Text>
            )}
            <AlertDialog.Footer>
              <ResponsivePair gap="x2">
                <AlertDialog.Action asChild>
                  <ActionButton variant="neutralWeak" disabled={remove.isPending}>
                    취소
                  </ActionButton>
                </AlertDialog.Action>
                <ActionButton
                  variant="criticalSolid"
                  disabled={remove.isPending}
                  loading={remove.isPending}
                  onClick={deleteNotice}
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
