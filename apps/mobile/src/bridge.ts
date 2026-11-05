/** WebView RPC 입력을 검증하고 native 인증·safe-area 기능을 연결하는 모듈입니다. */

import {
  INITIAL_SAFE_AREA_INSETS,
  normalizeSafeAreaInsets,
  completeSignupInputSchema,
  refreshSessionInputSchema,
  signInInputSchema,
  type AuthResult,
  type AppBridgeState,
  type SafeAreaInsets,
} from '@yapp-plus/app-bridge';
import { bridge, createWebView } from '@webview-bridge/react-native';
import { useEffect } from 'react';
import { initialWindowMetrics } from 'react-native-safe-area-context';

import { authActions } from './auth/native-auth-runtime';

const initialSafeAreaInsets = normalizeSafeAreaInsets(
  initialWindowMetrics?.insets ?? INITIAL_SAFE_AREA_INSETS,
);

const invalidInput = (): Promise<AuthResult> =>
  Promise.resolve({
    status: 'ERROR',
    code: 'INVALID_INPUT',
    retryable: false,
  });

export const nativeAppBridge = bridge<AppBridgeState>(({ get }) => ({
  safeAreaInsets: initialSafeAreaInsets,
  getSafeAreaInsets: () => Promise.resolve(get().safeAreaInsets),
  signIn: (input) => {
    const parsed = signInInputSchema.safeParse(input);
    return parsed.success ? authActions.signIn(parsed.data) : invalidInput();
  },
  completeSignup: (input) => {
    const parsed = completeSignupInputSchema.safeParse(input);
    return parsed.success ? authActions.completeSignup(parsed.data) : invalidInput();
  },
  getSession: () => authActions.getSession(),
  refreshSession: (input) => {
    const parsed = refreshSessionInputSchema.safeParse(input);
    return parsed.success ? authActions.refreshSession(parsed.data) : invalidInput();
  },
  signOut: () => authActions.signOut(),
  withdraw: () => authActions.withdraw(),
}));

export const { WebView: BridgeWebView } = createWebView({
  bridge: nativeAppBridge,
  debug: __DEV__,
  responseTimeout: 180_000,
});

export const useSyncSafeAreaInsets = (insets: SafeAreaInsets): void => {
  const { top, right, bottom, left } = insets;

  useEffect(() => {
    nativeAppBridge.setState({
      safeAreaInsets: normalizeSafeAreaInsets({ top, right, bottom, left }),
    });
  }, [top, right, bottom, left]);
};
