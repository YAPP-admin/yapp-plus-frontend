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
import type { SessionManager } from './session';
import { toCredentials } from './credentials';

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
  private authenticatingGeneration: number | undefined;

  public constructor(runtime: NativeAuthRuntime) {
    this.runtime = runtime;
  }

  /** 공급자 SDK와 생성 OpenAPI 인증 요청을 순서대로 실행합니다. */
  public async signIn(input: SignInInput): Promise<AuthResult> {
    if (this.isAuthenticating()) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.busy, retryable: true };
    }

    const generation = this.runtime.session.captureGeneration();
    this.authenticatingGeneration = generation;
    this.registration = undefined;
    try {
      const identity = await this.runtime.authenticateWithProvider(input.provider);
      if (!this.runtime.session.isCurrent(generation)) {
        return { status: AUTH_STATUS.cancelled };
      }
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

      return await this.acceptAuthenticationResult(result, generation);
    } catch (error) {
      if (!this.runtime.session.isCurrent(generation)) {
        return { status: AUTH_STATUS.cancelled };
      }
      return this.toSignInError(error);
    } finally {
      this.finishAuthentication(generation);
    }
  }

  /** 가입 대기 토큰을 소비해 프로필을 등록하고 세션을 시작합니다. */
  public async completeSignup(input: CompleteSignupInput): Promise<AuthResult> {
    if (this.isAuthenticating()) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.busy, retryable: true };
    }
    if (!this.registration || this.registration.expiresAt <= Date.now()) {
      this.registration = undefined;

      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.signupExpired, retryable: false };
    }

    const generation = this.runtime.session.captureGeneration();
    this.authenticatingGeneration = generation;
    try {
      const result = await this.runtime.register({
        body: {
          registrationToken: this.registration.token,
          name: input.name,
          phoneNumber: toPhoneNumber(input.phoneNumber),
        },
      });
      return await this.acceptCompletedSignup(result.data, generation);
    } catch (error) {
      if (!this.runtime.session.isCurrent(generation)) {
        return { status: AUTH_STATUS.cancelled };
      }
      throw error;
    } finally {
      this.finishAuthentication(generation);
    }
  }

  /** 저장된 refresh token으로 현재 세션을 복구하거나 갱신합니다. */
  public getSession(): Promise<AuthResult> {
    return this.runtime.session.get((refreshToken) =>
      this.runtime.renew({ body: { refreshToken } }),
    );
  }

  /** WebView의 401 대응 요청에 대해 최신 access token을 반환합니다. */
  public refreshSession(input: RefreshSessionInput): Promise<AuthResult> {
    return this.runtime.session.refresh(input, (refreshToken) =>
      this.runtime.renew({ body: { refreshToken } }),
    );
  }

  /** 서버 응답을 기다리기 전에 로컬 세션을 무효화하고 삭제를 예약합니다. */
  public async signOut(): Promise<AuthResult> {
    const refreshToken = this.runtime.session.refreshToken;
    this.registration = undefined;
    const clearing = this.runtime.session.clear();
    const generation = this.runtime.session.captureGeneration();
    if (refreshToken) {
      try {
        await this.runtime.revoke({ body: { refreshToken } });
      } catch {
        // 서버 해제가 실패해도 기기에서 refresh token을 제거해 로그아웃을 완료합니다.
      }
    }

    const result = await clearing;
    // 새 로그인 진행·가입 대기도 이전 로그아웃 응답으로 덮지 않습니다.
    return this.runtime.session.isCurrent(generation) &&
      !this.isAuthenticating() &&
      !this.registration
      ? result
      : { status: AUTH_STATUS.cancelled };
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
    generation: number,
  ): Promise<AuthResult> {
    if (!this.runtime.session.isCurrent(generation)) {
      return { status: AUTH_STATUS.cancelled };
    }
    if (result.data === undefined) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.server, retryable: true };
    }

    const credentials = toCredentials(result.data);
    if (credentials) {
      return this.runtime.session.establish(credentials, generation);
    }

    return this.startSignup(result.data);
  }

  /** 가입 API의 성공 응답에는 반드시 세션 자격이 있어야 합니다. */
  private async acceptCompletedSignup(
    response: AuthenticationResponse | undefined,
    generation: number,
  ): Promise<AuthResult> {
    if (!this.runtime.session.isCurrent(generation)) {
      return { status: AUTH_STATUS.cancelled };
    }
    const credentials = response ? toCredentials(response) : undefined;
    if (!credentials) {
      return { status: AUTH_STATUS.error, code: AUTH_ERROR_CODE.invalidResponse, retryable: false };
    }

    this.registration = undefined;

    return this.runtime.session.establish(credentials, generation);
  }

  /** 무효화된 이전 세대의 인증은 새 인증을 막지 않습니다. */
  private isAuthenticating(): boolean {
    return (
      this.authenticatingGeneration !== undefined &&
      this.runtime.session.isCurrent(this.authenticatingGeneration)
    );
  }

  private finishAuthentication(generation: number): void {
    if (this.authenticatingGeneration === generation) {
      this.authenticatingGeneration = undefined;
    }
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
