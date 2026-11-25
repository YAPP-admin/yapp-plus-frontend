/** 업무 요청의 최종 인증 실패만 로그인 이동 대상으로 정규화합니다. */
import { ApiError } from '@yapp-plus/api';
import { AUTH_ERROR_CODE, type AuthResult } from '@yapp-plus/app-bridge';

/** 생성 SDK의 최종 401과 명시적인 브리지 재인증 요구만 인증 오류로 취급합니다. */
export const isAuthenticationError = (error: unknown): boolean =>
  (error instanceof ApiError && error.status === 401) ||
  (typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'code' in error &&
    error.status === 'ERROR' &&
    error.code === AUTH_ERROR_CODE.authRequired);

/** 브리지가 재인증을 명시한 결과는 네트워크·저장소 오류와 구분합니다. */
export const isAuthenticationRequiredResult = (
  result: AuthResult | undefined,
): result is Extract<AuthResult, { status: 'ERROR' | 'UNAVAILABLE' }> =>
  result?.status === 'ERROR' && result.code === AUTH_ERROR_CODE.authRequired;
