import { ApiError } from '@yapp-plus/api';
import { expect, it } from 'vitest';
import { isAuthenticationError, isAuthenticationRequiredResult } from './auth-error';

it.each([
  [new ApiError(401, {}), true],
  [new ApiError(403, {}), false],
  [{ status: 'ERROR', code: 'AUTH_REQUIRED', retryable: false }, true],
  [{ status: 'ERROR', code: 'NETWORK', retryable: true }, false],
  [new Error('401'), false],
])('인증 오류를 상태와 검증된 브리지 코드로만 판별한다', (error, expected) => {
  expect(isAuthenticationError(error)).toBe(expected);
});

it('브리지의 AUTH_REQUIRED만 재인증 결과로 판별한다', () => {
  expect(
    isAuthenticationRequiredResult({ status: 'ERROR', code: 'AUTH_REQUIRED', retryable: false }),
  ).toBe(true);
  expect(
    isAuthenticationRequiredResult({ status: 'ERROR', code: 'NETWORK', retryable: true }),
  ).toBe(false);
});
