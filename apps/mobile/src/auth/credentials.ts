/** API 자격을 검증하고 native 세션 저장에 필요한 값으로 변환합니다. */
import { sessionNameSchema } from '@yapp-plus/app-bridge';
import type { AuthenticationResponse } from '@yapp-plus/api/generated';
import type { SessionCredentials, SessionTokens } from './session';

/** 갱신 응답의 user는 비어 있을 수 있으므로 토큰만 검증합니다. */
export const toSessionTokens = (response: AuthenticationResponse): SessionTokens | undefined => {
  if (
    response.result !== 'SIGNED_IN' ||
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
  };
};

/** 로그인·가입에는 서버가 인증한 사용자 ID가 필요합니다. */
export const toCredentials = (response: AuthenticationResponse): SessionCredentials | undefined => {
  const tokens = toSessionTokens(response);
  if (!tokens || !response.user || !Number.isSafeInteger(response.user.id)) {
    return undefined;
  }
  return { ...tokens, userId: response.user.id, name: sessionNameSchema.parse(response.user.name) };
};
