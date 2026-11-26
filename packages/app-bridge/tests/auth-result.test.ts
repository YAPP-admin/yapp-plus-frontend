/** 인증 응답의 필수 필드와 잘못된 입력의 거부를 검증합니다. */
import { expect, it } from 'vitest';
import { authResultSchema, normalizeAuthResult, type AuthResult } from '../src/index';

const legacy = {
  status: 'SIGNED_IN',
  session: {
    accessToken: 'test',
    expiresAt: 123,
    userId: 1,
    sessionId: 'session',
    tokenVersion: 1,
  },
};

it('전환 값이 없는 구 앱 응답도 필수 계약에 따라 거부한다', () => {
  expect(authResultSchema.safeParse(legacy).success).toBe(false);
  expect(normalizeAuthResult(legacy)).toEqual({
    status: 'ERROR',
    code: 'INVALID_RESPONSE',
    retryable: false,
  });
  expect(authResultSchema.safeParse({ ...legacy, reviewTransition: 'NONE' }).success).toBe(true);
});

it('내부 SIGNED_IN 타입에서도 전환 값은 필수다', () => {
  type SignedIn = Extract<AuthResult, { status: 'SIGNED_IN' }>;
  const required: undefined extends SignedIn['reviewTransition'] ? false : true = true;
  expect(required).toBe(true);
});

it.each(['NONE', 'PENDING_TO_APPROVED'])('유효한 전환 값 %s는 보존한다', (reviewTransition) => {
  expect(normalizeAuthResult({ ...legacy, reviewTransition })).toEqual({
    ...legacy,
    reviewTransition,
  });
});

it.each([
  null,
  { ...legacy, reviewTransition: 'UNKNOWN' },
  { ...legacy, reviewTransition: null },
  { ...legacy, reviewTransition: 'NONE', session: { ...legacy.session, accessToken: '' } },
  { status: 'REVIEW_REQUIRED', userId: 1, reviewStatus: 'APPROVED' },
  { status: 'REVIEW_REQUIRED', userId: 1 },
  { status: 'REVIEW_REQUIRED', userId: '1', reviewStatus: 'PENDING' },
])('잘못된 입력은 세션 없는 오류로 변환한다 (%j)', (input) => {
  expect(normalizeAuthResult(input)).toEqual({
    status: 'ERROR',
    code: 'INVALID_RESPONSE',
    retryable: false,
  });
});

it.each(['PENDING', 'REJECTED', null])('제한 상태 %s는 토큰을 전달하지 않는다', (reviewStatus) => {
  expect(
    normalizeAuthResult({
      status: 'REVIEW_REQUIRED',
      userId: 1,
      reviewStatus,
      accessToken: 'discard',
    }),
  ).toEqual({ status: 'REVIEW_REQUIRED', userId: 1, reviewStatus });
});
