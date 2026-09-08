import {
  INITIAL_SAFE_AREA_INSETS,
  normalizeSafeAreaInsets,
  type AppBridgeState,
  type SafeAreaInsets,
} from '@yapp-plus/app-bridge';
import { bridge, createWebView } from '@webview-bridge/react-native';
import { useEffect } from 'react';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const initialSafeAreaInsets = normalizeSafeAreaInsets(
  initialWindowMetrics?.insets ?? INITIAL_SAFE_AREA_INSETS,
);

export const nativeAppBridge = bridge<AppBridgeState>(({ get }) => ({
  safeAreaInsets: initialSafeAreaInsets,
  getSafeAreaInsets: () => Promise.resolve(get().safeAreaInsets),
}));

export const { WebView: BridgeWebView } = createWebView({
  bridge: nativeAppBridge,
  debug: __DEV__,
});

export const useSyncSafeAreaInsets = (insets: SafeAreaInsets): void => {
  const { top, right, bottom, left } = insets;

  useEffect(() => {
    nativeAppBridge.setState({
      safeAreaInsets: normalizeSafeAreaInsets({ top, right, bottom, left }),
    });
  }, [top, right, bottom, left]);
};
