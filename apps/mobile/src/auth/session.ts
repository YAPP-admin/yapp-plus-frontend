import type { AuthResult, AuthSession, RefreshSessionInput } from '@yapp-plus/app-bridge';

import { authStorage } from './storage';

const REFRESH_EARLY_MS = 30_000;

export type SessionCredentials = Readonly<{
  /** WebView에 일시적으로만 공개할 API 접근 토큰입니다. */
  accessToken: string;
  /** Keychain에만 저장할 세션 갱신 토큰입니다. */
  refreshToken: string;
  /** Unix epoch 밀리초 기준 access token 만료 시각입니다. */
  expiresAt: number;
  /** 백엔드가 인증한 사용자 식별자입니다. */
  userId: number;
}>;

/** 생성 OpenAPI `renew` 호출을 주입하는 함수 형태입니다. */
type Renew = (refreshToken: string) => Promise<SessionCredentials>;

/**
 * 앱 범위에서 하나만 만드는 native 세션 관리자입니다.
 * SecureStore는 AuthStorage로 직접 사용하고, refresh 동시성만 이 클래스가 소유합니다.
 */
export class SessionManager {
  /**
   * WebView에 반환 가능한 현재 세션입니다.
   * 앱 종료 시 사라지며, access token과 refresh token을 함께 저장하지 않습니다.
   */
  private currentSession: AuthSession | undefined;

  /**
   * 현재 앱 프로세스가 사용 중인 refresh token입니다.
   * 앱 재시작 후에는 get()이 AuthStorage에서 다시 읽어 옵니다.
   */
  private currentRefreshToken: string | undefined;

  /**
   * 진행 중인 refresh Promise입니다.
   * 동시에 들어온 get()/refresh() 호출이 같은 요청을 기다리게 하는 single-flight 상태입니다.
   */
  private refreshing: Promise<AuthResult> | undefined;

  /**
   * 로그인·로그아웃·탈퇴처럼 세션 경계가 바뀔 때 증가하는 번호입니다.
   * 이전 세대의 늦은 refresh 응답은 이 값이 달라져 현재 세션을 덮어쓸 수 없습니다.
   */
  private generation = 0;

  /**
   * OIDC 로그인 또는 가입 완료 후 새 세션을 시작합니다.
   * refresh token 저장이 성공한 경우에만 access token을 WebView에 반환합니다.
   */
  public async establish(credentials: SessionCredentials): Promise<AuthResult> {
    const currentGeneration = ++this.generation;
    try {
      await authStorage.setRefreshToken(credentials.refreshToken);
    } catch {
      return { status: 'ERROR', code: 'STORAGE', retryable: true };
    }
    if (currentGeneration !== this.generation) {
      return { status: 'SIGNED_OUT' };
    }

    this.currentRefreshToken = credentials.refreshToken;
    this.currentSession = {
      accessToken: credentials.accessToken,
      expiresAt: credentials.expiresAt,
      userId: credentials.userId,
      sessionId: crypto.randomUUID(),
      tokenVersion: 1,
    };
    return { status: 'SIGNED_IN', session: this.currentSession };
  }

  /**
   * 현재 세션을 반환합니다.
   * access token이 30초 안에 만료되면 Keychain의 refresh token으로 갱신을 시작합니다.
   */
  public async get(renew: Renew): Promise<AuthResult> {
    if (this.currentSession && this.currentSession.expiresAt > Date.now() + REFRESH_EARLY_MS) {
      return { status: 'SIGNED_IN', session: this.currentSession };
    }
    if (!this.currentRefreshToken) {
      try {
        this.currentRefreshToken = (await authStorage.getRefreshToken()) ?? undefined;
      } catch {
        return { status: 'ERROR', code: 'STORAGE', retryable: true };
      }
    }
    return this.refresh(undefined, renew);
  }

  /**
   * WebView의 401 대응 refresh 요청을 처리합니다.
   * sessionId/tokenVersion이 오래됐다면 네트워크 요청 없이 최신 메모리 세션을 반환합니다.
   */
  public async refresh(input: RefreshSessionInput | undefined, renew: Renew): Promise<AuthResult> {
    if (input && input.sessionId !== this.currentSession?.sessionId) {
      return this.currentSession
        ? { status: 'SIGNED_IN', session: this.currentSession }
        : { status: 'SIGNED_OUT' };
    }
    if (input && input.tokenVersion !== this.currentSession?.tokenVersion) {
      return this.currentSession
        ? { status: 'SIGNED_IN', session: this.currentSession }
        : { status: 'SIGNED_OUT' };
    }
    if (!this.currentRefreshToken) {
      return { status: 'SIGNED_OUT' };
    }

    this.refreshing ??= this.refreshCurrentSession(
      this.generation,
      this.currentRefreshToken,
      renew,
    );
    return this.refreshing;
  }

  /**
   * 로그아웃 또는 탈퇴 뒤 로컬 세션을 제거합니다.
   * generation을 먼저 증가시켜 이미 진행 중인 refresh가 토큰을 복구하지 못하게 합니다.
   */
  public async clear(): Promise<AuthResult> {
    ++this.generation;
    this.currentSession = undefined;
    this.currentRefreshToken = undefined;
    try {
      await authStorage.clearSession();
      return { status: 'SIGNED_OUT' };
    } catch {
      return { status: 'ERROR', code: 'STORAGE', retryable: true };
    }
  }

  /** 탈퇴 API처럼 native 내부에서만 access token이 필요한 흐름에 사용합니다. */
  public get accessToken(): string | undefined {
    return this.currentSession?.accessToken;
  }

  /** 서버 로그아웃 요청에만 사용할 refresh token입니다. WebView에는 노출하지 않습니다. */
  public get refreshToken(): string | undefined {
    return this.currentRefreshToken;
  }

  /** refresh token 회전 결과를 현재 generation에만 저장하고 새 공개 세션을 만듭니다. */
  private async refreshCurrentSession(
    currentGeneration: number,
    refreshToken: string,
    renew: Renew,
  ): Promise<AuthResult> {
    try {
      const credentials = await renew(refreshToken);
      if (currentGeneration !== this.generation) {
        return { status: 'SIGNED_OUT' };
      }
      await authStorage.setRefreshToken(credentials.refreshToken);
      if (currentGeneration !== this.generation) {
        return { status: 'SIGNED_OUT' };
      }

      this.currentRefreshToken = credentials.refreshToken;
      this.currentSession = {
        accessToken: credentials.accessToken,
        expiresAt: credentials.expiresAt,
        userId: credentials.userId,
        sessionId: this.currentSession?.sessionId ?? crypto.randomUUID(),
        tokenVersion: (this.currentSession?.tokenVersion ?? 0) + 1,
      };
      return { status: 'SIGNED_IN', session: this.currentSession };
    } catch {
      return { status: 'UNAVAILABLE', code: 'NETWORK', retryable: true };
    } finally {
      this.refreshing = undefined;
    }
  }
}
