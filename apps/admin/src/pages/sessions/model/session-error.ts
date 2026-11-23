/** 세션 API 오류를 UI와 분리된 도메인 실패 결과로 변환한다. */
import { ApiError } from '@yapp-plus/api';
import { zErrorResponse } from '@yapp-plus/api/generated';

export type SessionOperation = 'list' | 'create' | 'update' | 'delete';

const SESSION_ERROR_CODES = [
  'SESSION_DATE_CONFLICT',
  'SESSION_DELETE_CONFLICT',
  'SESSION_NOT_FOUND',
  'SESSION_UPDATE_CONFLICT',
] as const;

export type SessionOperationFailureCode =
  | (typeof SESSION_ERROR_CODES)[number]
  | 'INVALID_SESSION_REQUEST'
  | 'UNAUTHORIZED'
  | 'SESSION_CONFLICT'
  | 'SESSION_LIST_UNAVAILABLE'
  | 'UNKNOWN_SESSION_RESULT';

export type SessionOperationFailure = {
  operation: SessionOperation;
  code: SessionOperationFailureCode;
};

const STATUS_TO_SESSION_FAILURE_CODE: Record<number, SessionOperationFailureCode> = {
  400: 'INVALID_SESSION_REQUEST',
  401: 'UNAUTHORIZED',
  404: 'SESSION_NOT_FOUND',
  409: 'SESSION_CONFLICT',
};

function isSessionErrorCode(code: string): code is (typeof SESSION_ERROR_CODES)[number] {
  return SESSION_ERROR_CODES.some((sessionErrorCode) => sessionErrorCode === code);
}

/** Query·Mutation 경계가 UI에 전달할 세션 도메인 실패 결과를 만든다. */
export function toSessionOperationFailure(
  error: unknown,
  operation: SessionOperation,
): SessionOperationFailure {
  if (error instanceof ApiError) {
    const body = zErrorResponse.safeParse(error.body);
    if (body.success && isSessionErrorCode(body.data.code)) {
      return { operation, code: body.data.code };
    }

    const code = STATUS_TO_SESSION_FAILURE_CODE[error.status];
    if (code) {
      return { operation, code };
    }
  }

  return {
    operation,
    code: operation === 'list' ? 'SESSION_LIST_UNAVAILABLE' : 'UNKNOWN_SESSION_RESULT',
  };
}
