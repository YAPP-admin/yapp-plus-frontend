/**
 * WebView의 URL history와 Android 시스템 뒤로가기를 연결하는 탐색 훅입니다.
 *
 * WebView 인스턴스와 최신 `canGoBack` 값은 렌더링과 무관한 imperative 상태이므로
 * state 대신 ref로 보관합니다. root 화면에서는 이벤트를 소비하지 않고 Android의
 * 기본 종료 동작으로 넘깁니다.
 */
import type { BridgeWebView } from '@webview-bridge/react-native';
import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import type { WebViewNavigation } from 'react-native-webview';

/**
 * WebView history가 있으면 한 단계 뒤로 이동하고, root에서는 native back을 위임합니다.
 */
export const useWebViewBackHandler = () => {
  const webViewRef = useRef<BridgeWebView>(null);
  const canGoBackRef = useRef(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBackRef.current) {
        return false;
      }

      webViewRef.current?.goBack();
      return true;
    });

    return () => subscription.remove();
  }, []);

  const handleNavigationStateChange = ({ canGoBack }: WebViewNavigation) => {
    canGoBackRef.current = canGoBack;
  };

  return { handleNavigationStateChange, webViewRef };
};
