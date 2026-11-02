import { YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN } from '@yapp-plus/app-bridge';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BridgeWebView, useSyncSafeAreaInsets } from '../src/bridge';
import { useWebViewBackHandler } from '../src/use-webview-back-handler';
import { resolveMobileWebUrl } from '../src/web-url';

const webUrl = resolveMobileWebUrl();

/**
 * safe-area bridge와 WebView history를 native 앱 셸에 연결하는 화면입니다.
 */
export default function WebViewScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { handleNavigationStateChange, webViewRef } = useWebViewBackHandler();

  useSyncSafeAreaInsets(safeAreaInsets);

  return (
    <View style={styles.container}>
      <BridgeWebView
        automaticallyAdjustContentInsets={false}
        applicationNameForUserAgent={YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN}
        onNavigationStateChange={handleNavigationStateChange}
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
