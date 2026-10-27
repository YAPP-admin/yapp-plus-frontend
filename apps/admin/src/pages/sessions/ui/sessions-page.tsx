/** 목록 조회 상태를 구분하며 필터는 라우터가 소유합니다. */
import { useHydrated } from '@tanstack/react-router';
import { useState } from 'react';
import { Portal, Snackbar, useSnackbarAdapter } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import type { SessionFilter } from '../model/session-search';
import {
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useSessionsQuery,
} from '../model/session-queries';
import { sortSessions, type Session } from '../model/session';
import { SessionTypeFilter } from './session-type-filter';
import { SessionList } from './session-list';
import { SessionForm } from './session-form';
import { page, title, description, placeholder, createButton } from './sessions-page.css';

type Props = {
  type: SessionFilter;
  onTypeChange: (type: SessionFilter) => void;
};

export function SessionsPage(props: Props) {
  return (
    <Snackbar.RootProvider>
      <SessionsContent {...props} />
      <Portal>
        <Snackbar.Region aria-label="세션 알림" data-seed-color-mode="dark-only">
          <Snackbar.Renderer />
        </Snackbar.Region>
      </Portal>
    </Snackbar.RootProvider>
  );
}

function SessionsContent({ type, onTypeChange }: Props) {
  const hydrated = useHydrated();
  const sessionsQuery = useSessionsQuery();
  const createSession = useCreateSessionMutation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const updateSession = useUpdateSessionMutation();
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const snackbar = useSnackbarAdapter();

  function renderList() {
    if (!hydrated) {
      return <output className={placeholder}>세션 목록을 불러오는 중입니다.</output>;
    }
    if (sessionsQuery.isError) {
      return (
        <div role="alert" className={placeholder}>
          <p>세션 목록을 불러오지 못했습니다.</p>
          <ActionButton
            type="button"
            variant="neutralWeak"
            disabled={sessionsQuery.isFetching}
            onClick={() => void sessionsQuery.refetch({ cancelRefetch: false })}
          >
            다시 시도
          </ActionButton>
        </div>
      );
    }
    if (!sessionsQuery.isSuccess) {
      return <output className={placeholder}>세션 목록을 불러오는 중입니다.</output>;
    }
    const sessions = sortSessions(sessionsQuery.data).filter(
      (session) => type === 'all' || session.type === type,
    );
    return (
      <SessionList
        sessions={sessions}
        type={type}
        totalCount={sessionsQuery.data.length}
        onEdit={setSessionToEdit}
      />
    );
  }

  return (
    <main className={page}>
      <h1 className={title}>세션 관리</h1>
      <p className={description}>유형별 세션을 확인합니다.</p>
      <p className={description}>예시 데이터입니다. 변경사항은 새로고침하면 초기화됩니다.</p>
      <ActionButton
        className={createButton}
        type="button"
        disabled={!hydrated}
        onClick={() => setIsCreateDialogOpen(true)}
      >
        세션 추가
      </ActionButton>
      <SessionTypeFilter value={type} onValueChange={onTypeChange} />
      {renderList()}
      {sessionToEdit && (
        <SessionForm
          key={sessionToEdit.id}
          initialValues={sessionToEdit}
          onSubmit={async (input) => {
            await updateSession.mutateAsync({ id: sessionToEdit.id, input });
            setSessionToEdit(null);
            snackbar.create({
              render: () => (
                <Snackbar.Root>
                  <Snackbar.Content>
                    <Snackbar.Message>
                      {type !== 'all' && input.type !== type
                        ? '세션을 수정했습니다. 변경한 유형은 전체 목록에서 확인할 수 있습니다.'
                        : '세션을 수정했습니다.'}
                    </Snackbar.Message>
                  </Snackbar.Content>
                  <Snackbar.HiddenCloseButton aria-label="알림 닫기" />
                </Snackbar.Root>
              ),
            });
          }}
          onClose={() => setSessionToEdit(null)}
        />
      )}
      {isCreateDialogOpen && (
        <SessionForm
          onSubmit={async (input) => {
            await createSession.mutateAsync(input);
            setIsCreateDialogOpen(false);
            onTypeChange('all');
          }}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      )}
    </main>
  );
}
