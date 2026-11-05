import { YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN } from '@yapp-plus/app-bridge';
import { useCallback } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BridgeWebView, useSyncSafeAreaInsets } from '../src/bridge';
import { useWebViewBackHandler } from '../src/use-webview-back-handler';
import { resolveMobileWebUrl } from '../src/web-url';

const webUrl = resolveMobileWebUrl();
const trustedOrigin = new URL(webUrl).origin;

/** 서비스 origin 밖의 탐색은 WebView에 남기지 않고 시스템 브라우저로 넘깁니다. */
const shouldKeepNavigationInWebView = (url: string): boolean => {
  try {
    return new URL(url).origin === trustedOrigin;
  } catch {
    return false;
  }
};

/**
 * safe-area bridge와 WebView history를 native 앱 셸에 연결하는 화면입니다.
 */
export default function WebViewScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { handleNavigationStateChange, webViewRef } = useWebViewBackHandler();

  useSyncSafeAreaInsets(safeAreaInsets);

  const handleShouldStartLoadWithRequest = useCallback((request: { url: string }): boolean => {
    if (shouldKeepNavigationInWebView(request.url)) {
      return true;
    }

    void Linking.openURL(request.url);

    return false;
  }, []);

  return (
    <View style={styles.container}>
      <BridgeWebView
        automaticallyAdjustContentInsets={false}
        applicationNameForUserAgent={YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        contentInsetAdjustmentBehavior="never"
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        )}
        source={{ uri: webUrl }}
        startInLoadingState
        style={styles.webView}
        ref={webViewRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  webView: {
    flex: 1,
  },
});
