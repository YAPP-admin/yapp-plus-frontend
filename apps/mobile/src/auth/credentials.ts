/** API 자격을 검증하고 native 세션 저장에 필요한 값으로 변환합니다. */
import type { AuthenticationResponse } from '@yapp-plus/api/generated';
import type { SessionCredentials } from './session';

export const toCredentials = (response: AuthenticationResponse): SessionCredentials | undefined => {
  if (
    response.result !== 'SIGNED_IN' ||
    !response.user ||
    !Number.isSafeInteger(response.user.id) ||
    typeof response.session?.refreshToken !== 'string' ||
    response.session.refreshToken.trim().length === 0 ||
    typeof response.session.accessToken !== 'string' ||
    response.session.accessToken.trim().length === 0 ||
    !Number.isSafeInteger(response.session.expiresIn) ||
    response.session.expiresIn <= 0
  ) {
    return undefined;
  }

  const expiresAt = Date.now() + response.session.expiresIn * 1_000;
  if (!Number.isSafeInteger(expiresAt)) {
    return undefined;
  }
  return {
    accessToken: response.session.accessToken,
    refreshToken: response.session.refreshToken,
    expiresAt,
    userId: response.user.id,
  };
};
