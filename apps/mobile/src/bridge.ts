import {
  INITIAL_SAFE_AREA_INSETS,
  normalizeSafeAreaInsets,
  type AuthResult,
  type AppBridgeState,
  type SafeAreaInsets,
} from '@yapp-plus/app-bridge';
import { bridge, createWebView } from '@webview-bridge/react-native';
import { useEffect } from 'react';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const initialSafeAreaInsets = normalizeSafeAreaInsets(
  initialWindowMetrics?.insets ?? INITIAL_SAFE_AREA_INSETS,
);

const unsupportedAuthOperation = (): Promise<AuthResult> =>
  Promise.resolve({
    status: 'ERROR',
    code: 'UNSUPPORTED',
    retryable: false,
  });

export const nativeAppBridge = bridge<AppBridgeState>(({ get }) => ({
  safeAreaInsets: initialSafeAreaInsets,
  authRevision: 0,
  getSafeAreaInsets: () => Promise.resolve(get().safeAreaInsets),
  signIn: unsupportedAuthOperation,
  completeSignup: unsupportedAuthOperation,
  getSession: unsupportedAuthOperation,
  refreshSession: unsupportedAuthOperation,
  signOut: unsupportedAuthOperation,
  withdraw: unsupportedAuthOperation,
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
