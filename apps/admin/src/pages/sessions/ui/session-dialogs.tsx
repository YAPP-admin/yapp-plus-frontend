/** 각 모달이 저장 요청을 소유하며 성공한 경우에만 닫습니다. */
import { useEffect, useRef } from 'react';
import { Snackbar, useSnackbarAdapter } from '@seed-design/react';
import type { Session } from '../model/session';
import type { SessionFilter } from '../model/session-search';
import { useCreateSessionMutation, useUpdateSessionMutation } from '../model/session-queries';
import { SessionForm } from './session-form';

export function CreateSessionDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const createSession = useCreateSessionMutation();

  return (
    <SessionForm
      onSubmit={async (input) => {
        await createSession.mutateAsync(input, {
          // 화면이 해제되면 MutationObserver가 이 화면 전용 콜백을 실행하지 않습니다.
          onSuccess: () => {
            onClose();
            onCreated();
          },
        });
      }}
      onClose={onClose}
    />
  );
}

export function EditSessionDialog({
  session,
  filter,
  onClose,
}: {
  session: Session;
  filter: SessionFilter;
  onClose: () => void;
}) {
  const updateSession = useUpdateSessionMutation();
  const snackbar = useSnackbarAdapter();
  const currentFilter = useRef(filter);
  useEffect(() => {
    currentFilter.current = filter;
  }, [filter]);

  return (
    <SessionForm
      initialValues={session}
      onSubmit={async (input) => {
        await updateSession.mutateAsync(
          { id: session.id, input },
          {
            onSuccess: () => {
              onClose();
              snackbar.create({
                render: () => (
                  <Snackbar.Root>
                    <Snackbar.Content>
                      <Snackbar.Message>
                        {currentFilter.current !== 'all' && input.type !== currentFilter.current
                          ? '세션을 수정했습니다. 변경한 유형은 전체 목록에서 확인할 수 있습니다.'
                          : '세션을 수정했습니다.'}
                      </Snackbar.Message>
                    </Snackbar.Content>
                    <Snackbar.HiddenCloseButton aria-label="알림 닫기" />
                  </Snackbar.Root>
                ),
              });
            },
          },
        );
      }}
      onClose={onClose}
    />
  );
}
