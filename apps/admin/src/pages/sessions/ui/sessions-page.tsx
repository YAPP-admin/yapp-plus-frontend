/** 세션 목록·필터와 생성·수정·삭제 모달을 연결하고 저장 결과를 안내하는 관리 페이지입니다. */
import { ActionButton, useSnackbarAdapter } from '@seed-design/react';
import { useState } from 'react';
import { Snackbar } from '~/shared/ui/snackbar';
import type { SessionFilter } from '../model/session-search';
import type { CreateSessionInput, Session } from '../model/session';
import {
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  sessionQueries,
} from '../model/session-queries';
import { useQueryClient } from '@tanstack/react-query';
import { SessionDeleteDialog } from './session-delete-dialog';
import { SessionEditDialog } from './session-edit-dialog';
import { SessionCreateDialog } from './session-create-dialog';
import { SessionTypeFilter } from './session-type-filter';
import { SessionResults } from './session-results';
import * as styles from './sessions-page.css';

export function SessionsPage({
  type,
  onTypeChange,
}: {
  type: SessionFilter;
  onTypeChange: (type: SessionFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const snackbar = useSnackbarAdapter();
  const creation = useCreateSessionMutation();

  const [editing, setEditing] = useState<Session | null>(null);
  const update = useUpdateSessionMutation();
  const client = useQueryClient();
  const [deleting, setDeleting] = useState<Session | null>(null);
  const deletion = useDeleteSessionMutation();
  const openDelete = (session: Session) => {
    deletion.reset();
    setDeleting(session);
  };
  const confirmDelete = () => {
    if (!deleting || deletion.isPending) {
      return;
    }
    deletion.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null);
        snackbar.create({
          render: () => <Snackbar variant="positive" message="세션을 삭제했어요." />,
        });
      },
    });
  };
  const openEdit = (session: Session) => {
    update.reset();
    setEditing(session);
  };

  const saveEdit = (input: CreateSessionInput) => {
    if (!editing) {
      return;
    }
    update.mutate(
      { id: editing.id, input },
      {
        onSuccess: () => {
          setEditing(null);
          snackbar.create({
            render: () => <Snackbar variant="positive" message="세션을 수정했어요." />,
          });
        },
      },
    );
  };

  const changeOpen = (nextOpen: boolean) => {
    creation.reset();
    setOpen(nextOpen);
  };

  const submit = (input: CreateSessionInput, resetForm: () => void) => {
    creation.mutate(input, {
      onSuccess: () => {
        resetForm();
        onTypeChange('all');
        setOpen(false);
        snackbar.create({
          render: () => <Snackbar variant="positive" message="세션을 만들었어요." />,
        });
      },
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>세션 관리</h1>
          <p className={styles.description}>유형별 세션을 확인합니다.</p>
        </div>
        {import.meta.env.DEV && (
          <SessionCreateDialog
            trigger={
              <ActionButton variant="neutralSolid" size="medium">
                세션 만들기
              </ActionButton>
            }
            open={open}
            onOpenChange={changeOpen}
            onSubmit={submit}
            pending={creation.isPending}
            error={
              creation.isError
                ? '세션을 만들지 못했어요. 입력을 확인하고 다시 시도해 주세요.'
                : undefined
            }
          />
        )}
      </header>
      {editing && (
        <SessionEditDialog
          session={editing}
          onClose={() => setEditing(null)}
          onSubmit={saveEdit}
          pending={update.isPending}
          errorAction={
            <ActionButton
              variant="neutralWeak"
              onClick={() => {
                setEditing(null);
                void client.invalidateQueries({ queryKey: sessionQueries.list().queryKey });
              }}
            >
              닫고 목록 새로고침
            </ActionButton>
          }
          error={
            update.isError
              ? '세션을 수정하지 못했어요. 입력을 유지한 채 다시 저장하거나 목록을 새로고침해 주세요.'
              : undefined
          }
        />
      )}

      {deleting && (
        <SessionDeleteDialog
          session={deleting}
          pending={deletion.isPending}
          error={deletion.isError}
          onClose={() => setDeleting(null)}
          onConfirm={confirmDelete}
          onRefresh={() => {
            setDeleting(null);
            void client.invalidateQueries({ queryKey: sessionQueries.list().queryKey });
          }}
        />
      )}
      <SessionTypeFilter value={type} onValueChange={onTypeChange} />
      <SessionResults
        type={type}
        onResetFilter={() => onTypeChange('all')}
        onCreate={() => changeOpen(true)}
        onEdit={openEdit}
        onDelete={openDelete}
      />
    </main>
  );
}
