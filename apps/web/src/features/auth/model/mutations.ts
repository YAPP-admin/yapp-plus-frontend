/** 인증 mutation의 요청 계약과 세션 반영 로직을 한곳에서 관리합니다. */

import type { AuthProvider, AuthResult, CompleteSignupInput } from '@yapp-plus/app-bridge';
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
import { nativeSessionQueryKey } from './session';

type NativeAuthMutationResult = AuthResult | undefined;

const updateNativeSession = (queryClient: QueryClient, result: NativeAuthMutationResult): void => {
  if (result) {
    queryClient.setQueryData(nativeSessionQueryKey, result);
  }
};

/** native 로그인 요청과 성공한 세션의 query 반영을 연결합니다. */
export const nativeSignInMutationOptions = (queryClient: QueryClient) =>
  mutationOptions<AuthResult | undefined, Error, AuthProvider>({
    mutationFn: signInWithNative,
    onSuccess: (result) => updateNativeSession(queryClient, result),
  });

/** native 가입 완료 요청과 성공한 세션의 query 반영을 연결합니다. */
export const nativeSignupMutationOptions = (queryClient: QueryClient) =>
  mutationOptions<AuthResult | undefined, Error, CompleteSignupInput>({
    mutationFn: completeNativeSignup,
    onSuccess: (result) => updateNativeSession(queryClient, result),
  });

/** native 로그아웃 요청과 세션 query 반영을 연결합니다. */
export const nativeSignOutMutationOptions = (queryClient: QueryClient) =>
  mutationOptions<AuthResult | undefined, Error, undefined>({
    mutationFn: signOutNative,
    onSuccess: (result) => updateNativeSession(queryClient, result),
  });

/** native 탈퇴 요청과 세션 query 반영을 연결합니다. */
export const nativeWithdrawMutationOptions = (queryClient: QueryClient) =>
  mutationOptions<AuthResult | undefined, Error, undefined>({
    mutationFn: withdrawNative,
    onSuccess: (result) => updateNativeSession(queryClient, result),
  });

/** 로그인 화면에서 사용하는 native 로그인 mutation입니다. */
export const useNativeSignInMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(nativeSignInMutationOptions(queryClient));
};

/** 회원가입 화면에서 사용하는 native 가입 완료 mutation입니다. */
export const useNativeSignupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(nativeSignupMutationOptions(queryClient));
};

/** 설정 화면에서 사용하는 native 로그아웃 mutation입니다. */
export const useNativeSignOutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(nativeSignOutMutationOptions(queryClient));
};

/** 설정 화면에서 사용하는 native 탈퇴 mutation입니다. */
export const useNativeWithdrawMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(nativeWithdrawMutationOptions(queryClient));
};
