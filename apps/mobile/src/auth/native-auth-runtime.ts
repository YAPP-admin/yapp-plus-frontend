/** 운영 SDK·OpenAPI·세션 구현을 조합해 native 인증 런타임을 제공합니다. */

import { AuthActions } from './actions';
import { nativeAuthApi } from './auth-api';
import { authenticateWithProvider } from './providers';
import { SessionManager } from './session';

/** 브리지와 알림이 구독하는 앱 범위의 유일한 세션 관리자입니다. */
export const nativeSession = new SessionManager();

/** 브리지와 네이티브 알림이 같은 세션 관리자와 single-flight를 공유합니다. */
export const authActions = new AuthActions({
  session: nativeSession,
  authenticateWithProvider,
  authenticateApple: nativeAuthApi.authenticateApple,
  authenticateGoogle: nativeAuthApi.authenticateGoogle,
  register: nativeAuthApi.register,
  renew: nativeAuthApi.renew,
  revoke: nativeAuthApi.revoke,
  withdraw: nativeAuthApi.withdraw,
});
