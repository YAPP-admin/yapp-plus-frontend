/** QueryClient 수명 안에서 인증 결과와 화면 callback의 유효성을 함께 관리합니다. */
import { CancelledError, type QueryClient } from '@tanstack/react-query';
import type { AuthResult } from '@yapp-plus/app-bridge';
import { applyAccountBoundary } from './account';

export const nativeSessionQueryKey = ['native-auth', 'session'] as const;
export type AuthOperation = { generation: number; result?: AuthResult };
export type AuthOperationKind = 'authenticate' | 'signup' | 'logout' | 'withdraw';

type OperationState = { generation: number; authenticating?: AuthOperation };

export class AuthBusyError extends Error {
  constructor(public readonly generation: number) {
    super('인증이 진행 중입니다.');
  }
}

const states = new WeakMap<QueryClient, OperationState>();

/** QueryClient별로 세대를 격리해 서로 다른 앱·테스트의 인증 작업이 간섭하지 않게 합니다. */
const stateFor = (client: QueryClient): OperationState => {
  let state = states.get(client);
  if (!state) {
    state = { generation: 0 };
    states.set(client, state);
  }
  return state;
};

const unavailable: AuthResult = { status: 'UNAVAILABLE', code: 'OUTCOME_UNKNOWN', retryable: true };
const cancelled: AuthResult = { status: 'CANCELLED' };

/** 같은 세션의 갱신된 토큰을 이전 응답으로 되돌리는지 검사합니다. */
const isOlderSession = (client: QueryClient, result: AuthResult | undefined): boolean => {
  const current = client.getQueryData<AuthResult>(nativeSessionQueryKey);
  return (
    current?.status === 'SIGNED_IN' &&
    result?.status === 'SIGNED_IN' &&
    current.session.sessionId === result.session.sessionId &&
    current.session.tokenVersion > result.session.tokenVersion
  );
};

/** 새 인증 의도로 이전 작업과 조회를 무효화합니다. 중복 로그인·가입은 기존 작업을 유지합니다. */
export const beginAuthOperation = (client: QueryClient, kind: AuthOperationKind): AuthOperation => {
  const state = stateFor(client);
  const authenticating = kind === 'authenticate' || kind === 'signup';
  if (authenticating && state.authenticating?.generation === state.generation) {
    throw new AuthBusyError(state.generation);
  }

  const operation = { generation: ++state.generation };
  if (authenticating) {
    state.authenticating = operation;
  }

  void client.cancelQueries({ queryKey: nativeSessionQueryKey });
  if (kind === 'logout') {
    client.setQueryData(nativeSessionQueryKey, { status: 'AUTHENTICATING' });
  }

  return operation;
};

/** 현재 인증 의도에 속하며 이미 반영된 토큰보다 오래되지 않은 작업인지 검사합니다. */
export const isCurrentAuthOperation = (
  client: QueryClient,
  operation: AuthOperation,
  result?: AuthResult,
): boolean =>
  stateFor(client).generation === operation.generation && !isOlderSession(client, result);

/** 유효한 결과만 cache에 반영합니다. 인증 확정 시 작업 도중 시작된 조회도 무효화합니다. */
export const applyAuthResult = (
  client: QueryClient,
  operation: AuthOperation,
  kind: AuthOperationKind,
  response: AuthResult | undefined,
): AuthResult | undefined => {
  if (!isCurrentAuthOperation(client, operation, response)) {
    return cancelled;
  }

  const result =
    kind === 'logout' && (!response || response.status === 'CANCELLED') ? unavailable : response;
  if (
    result?.status === 'SIGNED_IN' ||
    result?.status === 'SIGNED_OUT' ||
    result?.status === 'WITHDRAWN'
  ) {
    // 작업 중 시작된 조회도 확정한 인증 결과를 덮지 못하게 합니다.
    operation.generation = ++stateFor(client).generation;
    void client.cancelQueries({ queryKey: nativeSessionQueryKey });
  }

  if (result && result.status !== 'CANCELLED') {
    applyAccountBoundary(client, result, kind === 'signup');
    client.setQueryData(nativeSessionQueryKey, result);
  }

  return result;
};

/** 끝난 작업이 소유한 중복 인증 제한만 해제해 새 작업의 제한을 지우지 않습니다. */
export const finishAuthOperation = (
  client: QueryClient,
  operation: AuthOperation | undefined,
): void => {
  const state = stateFor(client);
  if (state.authenticating === operation) {
    state.authenticating = undefined;
  }
};

/** 조회 중 인증 의도가 바뀌면 결과를 폐기하고, 조회 불가를 실제 로그아웃과 구분합니다. */
export const readAuthSession = async (
  client: QueryClient,
  signal: AbortSignal,
  request: () => Promise<AuthResult | undefined>,
): Promise<AuthResult> => {
  const state = stateFor(client);
  const generation = state.generation;

  let result: AuthResult;
  try {
    result = (await request()) ?? unavailable;
  } catch {
    result = { status: 'UNAVAILABLE', code: 'TIMEOUT', retryable: true };
  }

  if (signal.aborted || state.generation !== generation) {
    throw new CancelledError({ silent: true });
  }
  if (isOlderSession(client, result)) {
    return client.getQueryData<AuthResult>(nativeSessionQueryKey) ?? unavailable;
  }

  applyAccountBoundary(client, result);
  return result;
};
