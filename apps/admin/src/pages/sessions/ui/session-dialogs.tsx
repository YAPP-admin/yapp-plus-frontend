/** 세션 생성 Mutation과 폼의 제출 상태·오류 안내를 연결합니다. */
import { useState } from 'react';
import {
  toSessionOperationFailure,
  type SessionOperationFailureCode,
} from '../model/session-error';
import { toCreateSessionRequest } from '../model/session-api-model';
import { useCreateSessionMutation } from '../model/session-queries';
import { SessionForm } from './session-form';

const CREATE_FAILURE_MESSAGES = {
  SESSION_DATE_CONFLICT: '같은 날짜에 세션이 이미 있습니다. 날짜를 확인해 주세요.',
  INVALID_SESSION_REQUEST: '입력한 세션 정보를 확인해 주세요.',
  UNAUTHORIZED: '로그인이 필요합니다. 다시 로그인해 주세요.',
  SESSION_NOT_FOUND: '세션을 등록할 기수를 찾을 수 없습니다.',
  SESSION_CONFLICT: '세션을 등록할 수 없습니다. 날짜와 입력 정보를 확인해 주세요.',
  UNKNOWN_SESSION_RESULT: '저장 결과를 확인할 수 없습니다. 목록을 확인한 뒤 다시 시도해 주세요.',
} as const;

function getCreateFailureMessage(code: SessionOperationFailureCode) {
  switch (code) {
    case 'SESSION_DATE_CONFLICT':
    case 'INVALID_SESSION_REQUEST':
    case 'UNAUTHORIZED':
    case 'SESSION_NOT_FOUND':
    case 'SESSION_CONFLICT':
    case 'UNKNOWN_SESSION_RESULT':
      return CREATE_FAILURE_MESSAGES[code];
    case 'SESSION_DELETE_CONFLICT':
    case 'SESSION_LIST_UNAVAILABLE':
    case 'SESSION_UPDATE_CONFLICT':
      return CREATE_FAILURE_MESSAGES.UNKNOWN_SESSION_RESULT;
  }
  return CREATE_FAILURE_MESSAGES.UNKNOWN_SESSION_RESULT;
}

export function SessionCreateDialog({
  generationId,
  onCreated,
  onClose,
}: {
  generationId: number;
  onCreated: () => void;
  onClose: () => void;
}) {
  const [submissionError, setSubmissionError] = useState('');
  const createSession = useCreateSessionMutation(generationId);

  return (
    <SessionForm
      submissionPending={createSession.isPending}
      submissionError={submissionError}
      onClose={onClose}
      onSubmit={(input) => {
        setSubmissionError('');
        createSession.mutate(
          {
            path: { generationId },
            body: toCreateSessionRequest(input),
          },
          {
            onSuccess: onCreated,
            onError: (error) => {
              const failure = toSessionOperationFailure(error, 'create');
              setSubmissionError(getCreateFailureMessage(failure.code));
            },
          },
        );
      }}
    />
  );
}
