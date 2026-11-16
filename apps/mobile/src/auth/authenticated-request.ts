/** 네이티브 인증 요청의 401 재시도와 로그인 수명 경계를 처리합니다. HTTP 업무 응답은 호출자가 해석합니다. */
import type { AuthResult, AuthSession, RefreshSessionInput } from '@yapp-plus/app-bridge';

/** 요청 시작 당시 계정·로그인 수명·토큰 버전을 보존합니다. */
export type AuthRequestSession = Pick<
  AuthSession,
  'userId' | 'sessionId' | 'tokenVersion' | 'accessToken'
>;

/** 운영 SessionManager의 갱신과 스냅샷을 공급해 기존 single-flight를 공유합니다. */
export type AuthRequestRuntime = Readonly<{
  refreshSession: (input: RefreshSessionInput) => Promise<AuthResult>;
  getSessionSnapshot: () => AuthRequestSession | undefined;
}>;

/** 인증·전송 실패만 표현합니다. 업무별 HTTP 오류는 포함하지 않습니다. */
export type AuthRequestFailure = 'AUTH_REQUIRED' | 'NETWORK' | 'SERVER' | 'STORAGE' | 'CANCELLED';

/** HTTP 응답을 받기 전 전송이 실패하면 response가 없을 수 있습니다. */
type ApiResponse = Readonly<{ response?: Response }>;
type Request = (accessToken: string) => Promise<ApiResponse>;

/** 같은 로그인 수명에서 완료한 HTTP 응답 또는 인증·전송 실패를 반환합니다. */
export type AuthRequestResult =
  | ({ ok: true } & ApiResponse)
  | { ok: false; code: AuthRequestFailure };

const authHttpStatus = { unauthorized: 401 } as const;

/** 갱신의 일시적 실패를 재로그인이 필요한 상태와 구분합니다. */
const refreshFailure = (
  result: Exclude<AuthResult, { status: 'SIGNED_IN' }>,
): AuthRequestResult => {
  switch (result.status) {
    case 'CANCELLED':
      return { ok: false, code: 'CANCELLED' };
    case 'SIGNED_OUT':
    case 'WITHDRAWN':
    case 'SIGNUP_REQUIRED':
      return { ok: false, code: 'AUTH_REQUIRED' };
    case 'ERROR':
    case 'UNAVAILABLE':
      if (result.code === 'NETWORK' || result.code === 'TIMEOUT') {
        return { ok: false, code: 'NETWORK' };
      }
      return { ok: false, code: result.code === 'STORAGE' ? 'STORAGE' : 'SERVER' };
    case 'AUTHENTICATING':
      return { ok: false, code: 'SERVER' };
  }
  return { ok: false, code: 'SERVER' };
};

/** 요청 당시 세션을 유지한 채 401을 한 번 복구합니다. 갱신·취소 정책은 인증 모듈이 소유합니다. */
export const requestWithSessionRefresh = async (
  session: AuthRequestSession,
  request: Request,
  runtime: AuthRequestRuntime,
): Promise<AuthRequestResult> => {
  const isCurrent = () => {
    const current = runtime.getSessionSnapshot();
    return current?.userId === session.userId && current.sessionId === session.sessionId;
  };
  try {
    if (!isCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }
    const initialResponse = await request(session.accessToken);
    if (!isCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }
    if (initialResponse.response?.status !== authHttpStatus.unauthorized) {
      return { ok: true, response: initialResponse.response };
    }

    const refreshed = await runtime.refreshSession({
      sessionId: session.sessionId,
      tokenVersion: session.tokenVersion,
    });
    if (!isCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }
    if (refreshed.status !== 'SIGNED_IN') {
      return refreshFailure(refreshed);
    }
    if (
      refreshed.session.userId !== session.userId ||
      refreshed.session.sessionId !== session.sessionId ||
      refreshed.session.tokenVersion < session.tokenVersion
    ) {
      return { ok: false, code: 'CANCELLED' };
    }
    const retryResponse = await request(refreshed.session.accessToken);
    if (!isCurrent()) {
      return { ok: false, code: 'CANCELLED' };
    }
    return { ok: true, response: retryResponse.response };
  } catch {
    return { ok: false, code: 'NETWORK' };
  }
};
