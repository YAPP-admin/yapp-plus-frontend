/** 웹 화면이 사용하는 native 인증 행동과 세션 provider의 공개 진입점입니다. */

export {
  completeNativeSignup,
  getNativeSession,
  isNativeWebView,
  refreshNativeSession,
  signInWithNative,
  signOutNative,
  withdrawNative,
} from './model/native-auth';
export {
  type NativeAuthCallbacks,
  nativeSignInMutationOptions,
  nativeSignOutMutationOptions,
  nativeSignupMutationOptions,
  nativeWithdrawMutationOptions,
  useNativeSignInMutation,
  useNativeSignOutMutation,
  useNativeSignupMutation,
  useNativeWithdrawMutation,
} from './model/mutations';
export { isAuthenticationError, isAuthenticationRequiredResult } from './model/auth-error';
export {
  handleMutationAuthenticationError,
  handleQueryAuthenticationError,
} from './model/operations';
export {
  NativeAuthSessionProvider,
  nativeSessionQueryKey,
  nativeSessionQueryOptions,
  useNativeAuthSession,
  type NativeAuthSessionPhase,
} from './model/session';

export { AuthErrorBoundary } from './ui/auth-error-boundary';

export { NativeSessionRecovery } from './ui/native-session-recovery';
