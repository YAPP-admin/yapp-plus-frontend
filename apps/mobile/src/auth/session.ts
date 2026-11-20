/** refresh token 회전과 앱 프로세스 메모리 세션 수명을 관리하는 native 모듈입니다. */

import type { AuthResult, AuthSession, RefreshSessionInput } from '@yapp-plus/app-bridge';
import { randomUUID } from 'expo-crypto';
import Mutex from 'p-mutex';

import { authStorage, type StoredSession } from './storage';

const REFRESH_EARLY_MS = 30_000;

export type SessionTokens = Readonly<{
  /** WebView에 일시적으로만 공개할 API 접근 토큰입니다. */
  accessToken: string;
  /** Keychain에만 저장할 세션 갱신 토큰입니다. */
  refreshToken: string;
  /** Unix epoch 밀리초 기준 access token 만료 시각입니다. */
  expiresAt: number;
}>;

/** 로그인에서 검증한 계정 ID를 토큰과 결합합니다. */
export type SessionCredentials = SessionTokens & Readonly<{ userId: number; name?: string }>;

/** HTTP·SDK 예외를 세션 정책에서 분리하는 갱신 경계의 결과입니다. */
export type RenewalResult =
  | { kind: 'success'; tokens: SessionTokens }
  | { kind: 'invalid-session' }
  | { kind: 'temporary-failure'; reason: 'NETWORK' | 'TIMEOUT' | 'SERVER' }
  | { kind: 'invalid-response' }
  | { kind: 'rejected' };

type Renew = (refreshToken: string) => Promise<RenewalResult>;

/** 서버 revoke의 관찰 결과입니다. 로컬 로그아웃은 이 결과와 관계없이 진행합니다. */
export type RevocationResult = { ok: true } | { ok: false; code: 'NETWORK' | 'TIMEOUT' | 'SERVER' };

const unexpectedRenewalResult = (_result: never): never => {
  throw new Error('알 수 없는 세션 갱신 결과예요.');
};

type CommitOperation = { kind: 'establish' } | { kind: 'refresh'; previousToken: string };

type RestoreState = 'allowed' | 'blocked' | 'deletion-failed';

/**
 * 앱 범위에서 하나만 만드는 native 세션 관리자입니다.
 * 저장소 접근은 직렬화하고, 복구·갱신 요청은 세대별로 공유합니다.
 */
export class SessionManager {
  private readonly requests = new Set<Promise<unknown>>();
  private signingOut: Promise<AuthResult> | undefined;

  /** 종료 중에는 새 인증·갱신·등록 요청을 시작하지 않습니다. */
  public get isSigningOut(): boolean {
    return this.signingOut !== undefined;
  }

  /** 이미 시작한 요청의 401 복구까지 기다립니다. 종료 중 새 요청은 실행하지 않습니다. */
  public async runRequest<T>(request: () => Promise<T>): Promise<T | undefined> {
    if (this.isSigningOut) {
      return undefined;
    }
    const pending = request();
    this.requests.add(pending);
    try {
      return await pending;
    } finally {
      this.requests.delete(pending);
    }
  }

  /** 진행 중 작업의 토큰 회전을 기다린 뒤 서버 해제를 시도하고 로컬 자격을 삭제합니다. */
  public signOut(revoke: (token: string) => Promise<RevocationResult>): Promise<AuthResult> {
    if (this.signingOut) {
      return this.signingOut;
    }
    const pending = this.finishSignOut(revoke, this.generation).finally(() => {
      if (this.signingOut === pending) {
        this.signingOut = undefined;
      }
    });
    this.signingOut = pending;
    return pending;
  }

  private async finishSignOut(
    revoke: (token: string) => Promise<RevocationResult>,
    generation: number,
  ): Promise<AuthResult> {
    await Promise.allSettled(this.requests);
    await Promise.allSettled([this.restoring, this.refreshing]);
    if (!this.isCurrent(generation)) {
      // 대기하던 갱신이 이미 자격 만료를 확정했다면 웹에도 종료 상태를 전달합니다.
      if (!this.currentSession && this.restoreState === 'blocked') {
        return { status: 'SIGNED_OUT' };
      }
      return { status: 'CANCELLED' };
    }
    if (!this.storedSession && this.restoreState === 'allowed') {
      try {
        await this.loadStoredSession(generation);
      } catch {
        return { status: 'ERROR', code: 'STORAGE', retryable: true };
      }
      if (!this.isCurrent(generation)) {
        return { status: 'CANCELLED' };
      }
    }
    const token = this.refreshToken;
    if (token) {
      await revoke(token);
      if (!this.isCurrent(generation)) {
        return { status: 'CANCELLED' };
      }
      // 서버 세션 해제 실패는 이 기기에서 로그아웃할 수 없는 이유가 아닙니다.
      // 서버·푸시 등록의 잔존 여부는 운영 정책으로 추적합니다.
    }
    return this.clear();
  }

  private readonly listeners = new Set<() => void>();

  /** I/O 없이 현재 메모리 세션을 읽어 비동기 작업의 계정 경계를 확인합니다. */
  public get snapshot(): AuthSession | undefined {
    return this.currentSession;
  }

  /** 세션 확정·갱신·삭제를 구독합니다. 반환 함수로 앱 수명 종료 시 해제합니다. */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
  private readonly storageMutex = new Mutex();
  private restoring: Promise<AuthResult> | undefined;
  private restoreState: RestoreState = 'allowed';
  /**
   * WebView에 반환 가능한 현재 세션입니다.
   * 앱 종료 시 사라지며, access token과 refresh token을 함께 저장하지 않습니다.
   */
  private currentSession: AuthSession | undefined;

  /**
   * 현재 앱 프로세스가 사용하는 갱신 토큰과 계정 ID입니다.
   * 앱 재시작 후에는 get()이 AuthStorage에서 다시 읽어 옵니다.
   */
  private storedSession: StoredSession | undefined;

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
  public establish(
    credentials: SessionCredentials,
    currentGeneration: number,
  ): Promise<AuthResult> {
    return this.commit(credentials, currentGeneration, { kind: 'establish' });
  }

  /** provider·API 호출 전에 기록하는 내부 세대입니다. */
  public captureGeneration(): number {
    return this.generation;
  }

  /** 작업 시작 이후 로그아웃·새 세션 확정을 판별합니다. */
  public isCurrent(currentGeneration: number): boolean {
    return currentGeneration === this.generation;
  }

  /**
   * 현재 세션을 반환합니다.
   * access token이 30초 안에 만료되면 Keychain의 refresh token으로 갱신을 시작합니다.
   * 삭제 실패 후에는 이전 자격을 읽지 않고 삭제만 재시도합니다.
   */
  public async get(renew: Renew): Promise<AuthResult> {
    if (this.currentSession && this.currentSession.expiresAt > Date.now() + REFRESH_EARLY_MS) {
      return { status: 'SIGNED_IN', session: this.currentSession };
    }
    if (this.restoreState === 'blocked') {
      return { status: 'SIGNED_OUT' };
    }
    if (!this.restoring) {
      const operation =
        this.restoreState === 'deletion-failed'
          ? this.deleteSession(this.generation)
          : this.restore(this.generation, renew);
      const restoring = operation.finally(() => {
        if (this.restoring === restoring) {
          this.restoring = undefined;
        }
      });
      this.restoring = restoring;
    }
    return this.restoring;
  }

  private async restore(currentGeneration: number, renew: Renew): Promise<AuthResult> {
    if (!this.storedSession) {
      try {
        await this.loadStoredSession(currentGeneration);
      } catch {
        if (!this.isCurrent(currentGeneration)) {
          return { status: 'CANCELLED' };
        }
        return { status: 'ERROR', code: 'STORAGE', retryable: true };
      }
    }
    if (!this.isCurrent(currentGeneration)) {
      return { status: 'CANCELLED' };
    }
    return this.refresh(undefined, renew);
  }

  private async loadStoredSession(currentGeneration: number): Promise<void> {
    await this.storageMutex.withLock(async () => {
      if (!this.isCurrent(currentGeneration) || this.storedSession) {
        return;
      }
      const session = await authStorage.getSession();
      if (this.isCurrent(currentGeneration)) {
        this.storedSession = session ?? undefined;
      }
    });
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
    if (!this.storedSession) {
      return { status: 'SIGNED_OUT' };
    }

    if (!this.refreshing) {
      const refreshing = this.refreshCurrentSession(
        this.generation,
        this.storedSession,
        renew,
      ).finally(() => {
        if (this.refreshing === refreshing) {
          this.refreshing = undefined;
        }
      });
      this.refreshing = refreshing;
    }
    return this.refreshing;
  }

  /**
   * 로그아웃 또는 탈퇴 뒤 로컬 세션을 제거합니다.
   * generation을 먼저 증가시켜 이미 진행 중인 refresh가 토큰을 복구하지 못하게 합니다.
   */
  public async clear(): Promise<AuthResult> {
    const currentGeneration = this.advanceGeneration();
    this.currentSession = undefined;
    this.storedSession = undefined;
    this.restoreState = 'blocked';
    this.notify();
    return this.deleteSession(currentGeneration);
  }

  /** 재시도는 세대를 올리지 않아 진행 중인 새 로그인을 취소하지 않습니다. */
  private async deleteSession(currentGeneration: number): Promise<AuthResult> {
    try {
      return await this.storageMutex.withLock(async (): Promise<AuthResult> => {
        if (!this.isCurrent(currentGeneration)) {
          return { status: 'CANCELLED' };
        }
        await authStorage.clearSession();
        if (!this.isCurrent(currentGeneration)) {
          return { status: 'CANCELLED' };
        }
        this.restoreState = 'blocked';
        return { status: 'SIGNED_OUT' };
      });
    } catch {
      if (!this.isCurrent(currentGeneration)) {
        return { status: 'CANCELLED' };
      }
      this.restoreState = 'deletion-failed';
      return { status: 'ERROR', code: 'STORAGE', retryable: true };
    }
  }

  /** 탈퇴 API처럼 native 내부에서만 access token이 필요한 흐름에 사용합니다. */
  public get accessToken(): string | undefined {
    return this.currentSession?.accessToken;
  }

  /** 서버 로그아웃 요청에만 사용할 refresh token입니다. WebView에는 노출하지 않습니다. */
  public get refreshToken(): string | undefined {
    return this.storedSession?.refreshToken;
  }

  /** refresh token 회전 결과를 현재 generation에만 저장하고 새 공개 세션을 만듭니다. */
  private async refreshCurrentSession(
    currentGeneration: number,
    storedSession: StoredSession,
    renew: Renew,
  ): Promise<AuthResult> {
    const { refreshToken, userId, name } = storedSession;
    const result = await renew(refreshToken);
    if (!this.isCurrent(currentGeneration) || refreshToken !== this.storedSession?.refreshToken) {
      return { status: 'CANCELLED' };
    }
    switch (result.kind) {
      case 'success': {
        const committed = await this.commit({ ...result.tokens, userId, name }, currentGeneration, {
          kind: 'refresh',
          previousToken: refreshToken,
        });
        // 회전한 refresh token을 저장하지 못하면 서버가 폐기한 이전 token을 다시 사용하지 않습니다.
        return committed.status === 'ERROR' && committed.code === 'STORAGE'
          ? this.clear()
          : committed;
      }
      case 'invalid-session':
        // 대상 검사와 clear의 즉시 무효화 사이에는 await를 두지 않습니다.
        return this.clear();
      case 'temporary-failure':
        return { status: 'UNAVAILABLE', code: result.reason, retryable: true };
      case 'invalid-response':
        return { status: 'UNAVAILABLE', code: 'INVALID_RESPONSE', retryable: false };
      case 'rejected':
        return { status: 'UNAVAILABLE', code: 'SERVER', retryable: false };
      default:
        return unexpectedRenewalResult(result);
    }
  }

  /** 세션 경계가 바뀌면 이전 세대의 진행 작업을 함께 분리합니다. */
  private advanceGeneration(): number {
    this.refreshing = undefined;
    this.restoring = undefined;
    return ++this.generation;
  }

  /** 세대·대상 검사와 저장을 직렬화합니다. 네트워크는 lock 밖에서 기다립니다. */
  private async commit(
    credentials: SessionCredentials,
    currentGeneration: number,
    operation: CommitOperation,
  ): Promise<AuthResult> {
    return this.storageMutex.withLock(async (): Promise<AuthResult> => {
      if (
        !this.isCurrent(currentGeneration) ||
        (operation.kind === 'refresh' &&
          operation.previousToken !== this.storedSession?.refreshToken)
      ) {
        return { status: 'CANCELLED' };
      }
      try {
        await authStorage.setSession({
          refreshToken: credentials.refreshToken,
          userId: credentials.userId,
          name: credentials.name,
        });
      } catch {
        return this.isCurrent(currentGeneration)
          ? { status: 'ERROR', code: 'STORAGE', retryable: true }
          : { status: 'CANCELLED' };
      }
      if (!this.isCurrent(currentGeneration)) {
        return { status: 'CANCELLED' };
      }
      const previous = operation.kind === 'refresh' ? this.currentSession : undefined;
      this.storedSession = {
        refreshToken: credentials.refreshToken,
        userId: credentials.userId,
        name: credentials.name,
      };
      this.currentSession = {
        accessToken: credentials.accessToken,
        expiresAt: credentials.expiresAt,
        userId: credentials.userId,
        name: credentials.name,
        sessionId: previous?.sessionId ?? randomUUID(),
        tokenVersion: (previous?.tokenVersion ?? 0) + 1,
      };
      if (operation.kind === 'establish') {
        this.advanceGeneration();
      }
      this.restoreState = 'allowed';
      this.notify();
      return { status: 'SIGNED_IN', session: this.currentSession };
    });
  }
}
