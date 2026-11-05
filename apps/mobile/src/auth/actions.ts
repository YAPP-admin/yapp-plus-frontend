/** OIDC·가입·세션 API 결과를 WebView 브리지 결과로 변환하는 인증 작업 모듈입니다. */

import {
  AUTH_ERROR_CODE,
  AUTH_STATUS,
  type AuthResult,
  type CompleteSignupInput,
  type RefreshSessionInput,
  type SignInInput,
} from '@yapp-plus/app-bridge';
import type { AuthenticationResponse } from '@yapp-plus/api/generated';

import type { nativeAuthApi, NativeAuthenticationApiResult } from './auth-api';
import { NativeAuthenticationCancelledError, NativeAuthenticationError } from './errors';
import type { authenticateWithProvider } from './providers';
import type { SessionManager, SessionCredentials } from './session';

type SignupRegistration = Readonly<{ token: string; expiresAt: number }>;

/** AuthActions가 인증 흐름을 수행할 때 사용하는 외부 경계입니다. */
export type NativeAuthRuntime = Readonly<{
  session: SessionManager;
  authenticateWithProvider: typeof authenticateWithProvider;
  authenticateApple: typeof nativeAuthApi.authenticateApple;
  authenticateGoogle: typeof nativeAuthApi.authenticateGoogle;
  register: typeof nativeAuthApi.register;
  renew: typeof nativeAuthApi.renew;
  revoke: typeof nativeAuthApi.revoke;
  withdraw: typeof nativeAuthApi.withdraw;
}>;

const toPhoneNumber = (phoneNumber: string): string => {
  const digits = phoneNumber.replaceAll(/[^0-9]/g, '');

  return digits.startsWith('0') ? `+82${digits.slice(1)}` : `+${digits}`;
};

/** native 인증 상태를 한 인스턴스에 모아 브리지 메서드를 제공합니다. */
export class AuthActions {
  private readonly runtime: NativeAuthRuntime;
  private registration: SignupRegistration | undefined;
  private authenticating = false;

  public constructor(runtime: NativeAuthRuntime) {
    this.runtime = runtime;
  }

  /** 공급자 SDK와 생성 OpenAPI 인증 요청을 순서대로 실행합니다. */
  public async signIn(input: SignInInput): Promise<AuthResult> {
    if (this.authenticating) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.busy, retryable: true };
    }

    this.authenticating = true;
    try {
      const identity = await this.runtime.authenticateWithProvider(input.provider);
      const result =
        identity.provider === 'apple'
          ? await this.runtime.authenticateApple({
              body: {
                idToken: identity.identityToken,
                authorizationCode: identity.authorizationCode,
                nonce: identity.nonce,
              },
            })
          : await this.runtime.authenticateGoogle({
              body: { idToken: identity.idToken, nonce: identity.nonce },
            });

      return await this.acceptAuthenticationResult(result);
    } catch (error) {
      return this.toSignInError(error);
    } finally {
      this.authenticating = false;
    }
  }

  /** 가입 대기 토큰을 소비해 프로필을 등록하고 세션을 시작합니다. */
  public async completeSignup(input: CompleteSignupInput): Promise<AuthResult> {
    if (!this.registration || this.registration.expiresAt <= Date.now()) {
      this.registration = undefined;

      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.signupExpired, retryable: false };
    }

    const result = await this.runtime.register({
      body: {
        registrationToken: this.registration.token,
        name: input.name,
        phoneNumber: toPhoneNumber(input.phoneNumber),
      },
    });

    return this.acceptCompletedSignup(result.data);
  }

  /** 저장된 refresh token으로 현재 세션을 복구하거나 갱신합니다. */
  public getSession(): Promise<AuthResult> {
    return this.runtime.session.get((refreshToken) => this.renewSession(refreshToken));
  }

  /** WebView의 401 대응 요청에 대해 최신 access token을 반환합니다. */
  public refreshSession(input: RefreshSessionInput): Promise<AuthResult> {
    return this.runtime.session.refresh(input, (refreshToken) => this.renewSession(refreshToken));
  }

  /** 서버 refresh token 폐기를 시도한 뒤 로컬 세션을 항상 제거합니다. */
  public async signOut(): Promise<AuthResult> {
    const refreshToken = this.runtime.session.refreshToken;
    if (refreshToken) {
      try {
        await this.runtime.revoke({ body: { refreshToken } });
      } catch {
        // 서버 해제가 실패해도 기기에서 refresh token을 제거해 로그아웃을 완료합니다.
      }
    }

    return this.runtime.session.clear();
  }

  /** 현재 access token으로 탈퇴를 완료한 뒤 로컬 자격을 제거합니다. */
  public async withdraw(): Promise<AuthResult> {
    const accessToken = this.runtime.session.accessToken;
    if (!accessToken) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.authRequired, retryable: false };
    }

    const result = await this.runtime.withdraw({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (result.error !== undefined) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.server, retryable: true };
    }

    const cleared = await this.runtime.session.clear();

    return cleared.status === AUTH_STATUS.signedOut ? { status: AUTH_STATUS.withdrawn } : cleared;
  }

  /** 생성 API 인증 응답을 로그인 완료 또는 가입 대기 상태로 변환합니다. */
  private async acceptAuthenticationResult(
    result: NativeAuthenticationApiResult,
  ): Promise<AuthResult> {
    if (result.data === undefined) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.server, retryable: true };
    }

    const credentials = this.toCredentials(result.data);
    if (credentials) {
      return this.runtime.session.establish(credentials);
    }

    return this.startSignup(result.data);
  }

  /** 가입 API의 성공 응답에는 반드시 세션 자격이 있어야 합니다. */
  private async acceptCompletedSignup(
    response: AuthenticationResponse | undefined,
  ): Promise<AuthResult> {
    const credentials = response ? this.toCredentials(response) : undefined;
    if (!credentials) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.invalidResponse, retryable: false };
    }

    this.registration = undefined;

    return this.runtime.session.establish(credentials);
  }

  /** refresh API 응답을 SessionManager가 저장할 자격 정보로 변환합니다. */
  private async renewSession(refreshToken: string): Promise<SessionCredentials> {
    const result = await this.runtime.renew({ body: { refreshToken } });
    const credentials = result.data ? this.toCredentials(result.data) : undefined;
    if (!credentials) {
      throw new Error('세션 갱신 응답이 올바르지 않아요.');
    }

    return credentials;
  }

  private toCredentials(response: AuthenticationResponse): SessionCredentials | undefined {
    if (
      response.result !== AUTH_STATUS.signedIn ||
      !response.user ||
      !response.session?.refreshToken ||
      !Number.isFinite(response.session.expiresIn)
    ) {
      return undefined;
    }

    return {
      accessToken: response.session.accessToken,
      refreshToken: response.session.refreshToken,
      expiresAt: Date.now() + response.session.expiresIn * 1_000,
      userId: response.user.id,
    };
  }

  private startSignup(response: AuthenticationResponse): AuthResult {
    const expiresIn = response.expiresIn;
    if (
      response.result !== AUTH_STATUS.signupRequired ||
      !response.registrationToken ||
      expiresIn === null ||
      !Number.isFinite(expiresIn)
    ) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.invalidResponse, retryable: false };
    }

    const expiresAt = Date.now() + expiresIn * 1_000;
    this.registration = { token: response.registrationToken, expiresAt };

    return { status: AUTH_STATUS.signupRequired, expiresAt };
  }

  private toSignInError(error: unknown): AuthResult {
    if (error instanceof NativeAuthenticationCancelledError) {
      return { status: AUTH_STATUS.cancelled };
    }
    if (error instanceof NativeAuthenticationError) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.server, retryable: true };
    }

    return { status: AUTH_STATUS.unavailable, code: AUTH_ERROR_CODE.network, retryable: true };
  }
}
