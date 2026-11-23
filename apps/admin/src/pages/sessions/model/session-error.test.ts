import { ApiError } from '@yapp-plus/api';
import { expect, it } from 'vitest';
import { toSessionOperationFailure } from './session-error';

it('본문의 세션 오류 코드를 도메인 실패 코드로 변환한다', () => {
  const error = new ApiError(409, { code: 'SESSION_DATE_CONFLICT', message: '원본 메시지' });

  expect(toSessionOperationFailure(error, 'create')).toEqual({
    operation: 'create',
    code: 'SESSION_DATE_CONFLICT',
  });
});

it.each([
  [401, 'UNAUTHORIZED'],
  [400, 'INVALID_SESSION_REQUEST'],
  [404, 'SESSION_NOT_FOUND'],
  [409, 'SESSION_CONFLICT'],
])('HTTP %i 오류를 세션 실패 코드로 변환한다', (status, code) => {
  expect(toSessionOperationFailure(new ApiError(status, null), 'list')).toEqual({
    operation: 'list',
    code,
  });
});

it('검증할 수 없는 본문과 전송 결과 불명확 오류를 구분한다', () => {
  expect(
    toSessionOperationFailure(new ApiError(500, { message: '비공개 정보' }), 'update'),
  ).toEqual({
    operation: 'update',
    code: 'UNKNOWN_SESSION_RESULT',
  });
  expect(toSessionOperationFailure(new Error('network details'), 'delete')).toEqual({
    operation: 'delete',
    code: 'UNKNOWN_SESSION_RESULT',
  });
});
