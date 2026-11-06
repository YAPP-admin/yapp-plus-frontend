/** React Query의 작업 문맥으로 인증 결과를 검증하고 현재 화면에만 알립니다. */
import type { AuthResult } from '@yapp-plus/app-bridge';
import {
  mutationOptions,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  completeNativeSignup,
  signInWithNative,
  signOutNative,
  withdrawNative,
} from './native-auth';
import {
  AuthBusyError,
  beginAuthOperation,
  applyAuthResult,
  finishAuthOperation,
  isCurrentAuthOperation,
  type AuthOperation,
  type AuthOperationKind,
} from './operations';

/** 화면이 인증 결과에 반응하는 계약입니다. 세대 검사와 cache 갱신은 hook이 담당합니다. */
export type NativeAuthCallbacks = Readonly<{
  onSignedIn?: () => void;
  onSignupRequired?: () => void;
  onSignedOut?: () => void;
  onWithdrawn?: () => void;
  onFailure?: (result: AuthResult | undefined) => void;
}>;

/** 유효성 검사를 마친 결과를 화면에서 필요한 동작으로 연결합니다. 취소는 알리지 않습니다. */
const notifyResult = (callbacks: NativeAuthCallbacks, result: AuthResult | undefined): void => {
  switch (result?.status) {
    case 'SIGNED_IN':
      callbacks.onSignedIn?.();
      break;
    case 'SIGNUP_REQUIRED':
      callbacks.onSignupRequired?.();
      break;
    case 'SIGNED_OUT':
      callbacks.onSignedOut?.();
      break;
    case 'WITHDRAWN':
      callbacks.onWithdrawn?.();
      break;
    case 'CANCELLED':
      break;
    case undefined:
    case 'AUTHENTICATING':
    case 'ERROR':
    case 'UNAVAILABLE':
      callbacks.onFailure?.(result);
  }
};

/**
 * 결과 반영 이후 다른 인증 작업이 시작됐을 수 있으므로 알림 직전에 다시 검사합니다.
 * onMutate에서 거절된 중복 요청은 문맥이 없어 오류에 기록한 세대로 BUSY 알림을 검사합니다.
 */
const notifyOperation = (
  client: QueryClient,
  callbacks: NativeAuthCallbacks,
  operation: AuthOperation | undefined,
  error: Error | null,
) => {
  const ticket = operation ?? (error instanceof AuthBusyError ? error : undefined);
  if (!ticket || !isCurrentAuthOperation(client, ticket, operation?.result)) {
    return;
  }

  notifyResult(
    callbacks,
    error instanceof AuthBusyError
      ? { status: 'ERROR', code: 'BUSY', retryable: true }
      : operation?.result,
  );
};

/** mutationFn에서도 RPC 시작 전 세대를 검사할 수 있도록 onMutate 문맥을 공유합니다. */
type AuthInput<Input> = { input: Input; operation?: AuthOperation };

/** 인증 시작·결과 반영·작업 해제를 React Query lifecycle에 연결합니다. */
const authMutationOptions = <Input>(
  client: QueryClient,
  kind: AuthOperationKind,
  request: (input: Input) => Promise<AuthResult | undefined>,
  callbacks: NativeAuthCallbacks = {},
) => {
  const complete = (result: AuthResult | undefined, operation: AuthOperation | undefined) => {
    if (!operation) {
      return;
    }

    operation.result = applyAuthResult(client, operation, kind, result);
  };

  return mutationOptions<AuthResult | undefined, Error, AuthInput<Input>, AuthOperation>({
    mutationKey: ['native-auth', kind],
    retry: false,
    onMutate: (variables) => {
      variables.operation = beginAuthOperation(client, kind);
      return variables.operation;
    },
    mutationFn: ({ input, operation }) =>
      operation && isCurrentAuthOperation(client, operation)
        ? request(input)
        : Promise.resolve({ status: 'CANCELLED' }),
    onSuccess: (result, _input, operation) => complete(result, operation),
    onError: (error, _input, operation) => {
      if (error instanceof AuthBusyError) {
        return;
      }
      complete({ status: 'UNAVAILABLE', code: 'OUTCOME_UNKNOWN', retryable: true }, operation);
    },
    onSettled: (_result, error, _input, operation) => {
      finishAuthOperation(client, operation);
      notifyOperation(client, callbacks, operation, error);
    },
  });
};

export const nativeSignInMutationOptions = (
  client: QueryClient,
  callbacks: NativeAuthCallbacks = {},
) => authMutationOptions(client, 'authenticate', signInWithNative, callbacks);

export const nativeSignupMutationOptions = (
  client: QueryClient,
  callbacks: NativeAuthCallbacks = {},
) => authMutationOptions(client, 'authenticate', completeNativeSignup, callbacks);

export const nativeSignOutMutationOptions = (
  client: QueryClient,
  callbacks: NativeAuthCallbacks = {},
) => authMutationOptions<undefined>(client, 'logout', signOutNative, callbacks);

export const nativeWithdrawMutationOptions = (
  client: QueryClient,
  callbacks: NativeAuthCallbacks = {},
) => authMutationOptions<undefined>(client, 'withdraw', withdrawNative, callbacks);

/** 세션 반영은 화면 수명과 무관하게 완료하고, 화면 callback만 unmount 뒤 차단합니다. */
const useAuthMutation = <Input>(
  kind: AuthOperationKind,
  request: (input: Input) => Promise<AuthResult | undefined>,
  callbacks: NativeAuthCallbacks,
) => {
  const client = useQueryClient();
  const mutation = useMutation(authMutationOptions(client, kind, request));

  // 호출별 callback은 React Query가 unmount 뒤 생략하고 연속 호출의 마지막 요청에만 전달합니다.
  // 세션 반영과 작업 해제는 위 mutation 옵션에서 화면 수명과 무관하게 완료합니다.
  const screenCallbacks = {
    onSettled: (
      _result: AuthResult | undefined,
      error: Error | null,
      _input: AuthInput<Input>,
      operation: AuthOperation | undefined,
    ) => notifyOperation(client, callbacks, operation, error),
  };

  return {
    isPending: mutation.isPending,
    mutate: (input: Input) => mutation.mutate({ input }, screenCallbacks),
  };
};

/** 소셜 로그인 결과를 현재 화면에 전달합니다. */
export const useNativeSignInMutation = (callbacks: NativeAuthCallbacks = {}) =>
  useAuthMutation('authenticate', signInWithNative, callbacks);

/** 가입 완료 결과를 현재 화면에 전달합니다. */
export const useNativeSignupMutation = (callbacks: NativeAuthCallbacks = {}) =>
  useAuthMutation('authenticate', completeNativeSignup, callbacks);

/** 로그아웃 결과를 현재 화면에 전달합니다. */
export const useNativeSignOutMutation = (callbacks: NativeAuthCallbacks = {}) =>
  useAuthMutation<undefined>('logout', signOutNative, callbacks);

/** 탈퇴 결과를 현재 화면에 전달합니다. */
export const useNativeWithdrawMutation = (callbacks: NativeAuthCallbacks = {}) =>
  useAuthMutation<undefined>('withdraw', withdrawNative, callbacks);
