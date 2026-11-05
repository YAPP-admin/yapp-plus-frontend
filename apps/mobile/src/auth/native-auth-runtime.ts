/** 운영 SDK·OpenAPI·세션 구현을 조합해 native 인증 런타임을 제공합니다. */

import { AuthActions } from './actions';
import { nativeAuthApi } from './auth-api';
import { authenticateWithProvider } from './providers';
import { SessionManager } from './session';

/** WebView 브리지가 사용하는 유일한 운영 인증 흐름 인스턴스입니다. */
export const authActions = new AuthActions({
  session: new SessionManager(),
  authenticateWithProvider,
  authenticateApple: nativeAuthApi.authenticateApple,
  authenticateGoogle: nativeAuthApi.authenticateGoogle,
  register: nativeAuthApi.register,
  renew: nativeAuthApi.renew,
  revoke: nativeAuthApi.revoke,
  withdraw: nativeAuthApi.withdraw,
});
