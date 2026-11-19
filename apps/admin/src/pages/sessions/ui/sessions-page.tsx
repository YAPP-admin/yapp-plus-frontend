/** 목록 조회 상태를 구분하며 필터는 라우터가 소유합니다. */
import { useRef } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { find1Options } from '@yapp-plus/api/generated';
import { ActionButton, Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import { overlay } from 'overlay-kit';
import type { SessionFilter } from '../model/session-search';
import { AttendanceQueryBoundary } from '~/features/session-management';
import { toSessionViewModel, type SessionViewModel } from '../model/session-api-model';
import type { SessionInput } from '../model/session-form';
import { SessionCreateDialog, SessionEditDialog } from './session-dialogs';
import { SessionDeleteDialog } from './session-delete-dialog';
import { SessionTypeFilter } from './session-type-filter';
import { SessionList } from './session-list';
import { description, heading, page, placeholder, refreshError, title } from './sessions-page.css';

type Props = {
  type: SessionFilter;
  generationId: number;
  onTypeChange: (type: SessionFilter) => void;
};

export function SessionsPage({ type, generationId, onTypeChange }: Props) {
  const snackbar = useSnackbarAdapter();
  const titleRef = useRef<HTMLHeadingElement>(null);

  function focusListTitle() {
    window.setTimeout(() => titleRef.current?.focus(), 0);
  }

  function openCreateDialog() {
    overlay.open(({ unmount }) => (
      <SessionCreateDialog
        generationId={generationId}
        onClose={unmount}
        onCreated={() => {
          unmount();
          onTypeChange('all');
          snackbar.create({
            render: () => <Snackbar variant="positive" message="세션을 추가했습니다." />,
          });
        }}
      />
    ));
  }

  function openEditDialog(session: SessionViewModel) {
    overlay.open(({ unmount }) => (
      <SessionEditDialog
        generationId={generationId}
        session={session}
        onClose={unmount}
        onUpdated={(input: SessionInput) => {
          unmount();
          const changedType = type !== 'all' && input.type !== type;
          snackbar.create({
            render: () => (
              <Snackbar
                variant="positive"
                message={
                  changedType
                    ? '세션을 수정했습니다. 변경한 유형은 전체 목록에서 확인할 수 있습니다.'
                    : '세션을 수정했습니다.'
                }
              />
            ),
          });
        }}
      />
    ));
  }

  function openDeleteDialog(session: SessionViewModel) {
    overlay.open(({ unmount }) => (
      <SessionDeleteDialog
        generationId={generationId}
        session={session}
        onClose={unmount}
        onDeleted={() => {
          unmount();
          snackbar.create({
            render: () => <Snackbar variant="positive" message="세션을 삭제했습니다." />,
          });
          focusListTitle();
        }}
        onMissing={() => {
          unmount();
          snackbar.create({
            render: () => (
              <Snackbar
                variant="critical"
                message="삭제할 세션을 찾을 수 없습니다. 목록을 새로고침했습니다."
              />
            ),
          });
          focusListTitle();
        }}
      />
    ));
  }

  return (
    <main className={page}>
      <div className={heading}>
        <div>
          <h1 ref={titleRef} tabIndex={-1} className={title}>
            세션 관리
          </h1>
          <p className={description}>유형별 세션을 확인합니다.</p>
        </div>
        <ActionButton type="button" onClick={openCreateDialog}>
          세션 추가
        </ActionButton>
      </div>
      <SessionTypeFilter value={type} onValueChange={onTypeChange} />
      <AttendanceQueryBoundary
        fallback={<output className={placeholder}>세션 목록을 불러오는 중입니다.</output>}
        errorMessage="세션 목록을 불러오지 못했습니다."
        resetKey="session-management-list"
      >
        <SessionListData
          type={type}
          generationId={generationId}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      </AttendanceQueryBoundary>
    </main>
  );
}

function SessionListData({
  type,
  generationId,
  onEdit,
  onDelete,
}: {
  type: SessionFilter;
  generationId: number;
  onEdit: (session: SessionViewModel) => void;
  onDelete: (session: SessionViewModel) => void;
}) {
  const sessionList = useSuspenseQuery(
    find1Options({ path: { generationId }, query: { type: 'ALL' } }),
  );
  const sessionData = sessionList.data;
  const sessions = sessionData.sessions
    .map(toSessionViewModel)
    .toSorted((left, right) =>
      `${right.date}T${right.startTime}`.localeCompare(`${left.date}T${left.startTime}`),
    )
    .filter((session) => type === 'all' || session.type === type);

  return (
    <>
      {sessionList.isError ? (
        <div className={refreshError} role="alert">
          <span>세션 목록을 새로고치지 못했습니다. 표시된 내용이 최신이 아닐 수 있습니다.</span>
          <ActionButton
            type="button"
            variant="neutralWeak"
            loading={sessionList.isFetching}
            onClick={() => void sessionList.refetch()}
          >
            다시 시도
          </ActionButton>
        </div>
      ) : null}
      <SessionList
        sessions={sessions}
        type={type}
        totalCount={sessionData.allCount}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
