import { linkBridge } from '@webview-bridge/web';

import {
  INITIAL_SAFE_AREA_INSETS,
  SAFE_AREA_CSS_VARIABLES,
  normalizeSafeAreaInsets,
  type AppBridgeState,
  type AppBridgeStore,
  type SafeAreaInsets,
} from './index';

export type CssVariableTarget = {
  setProperty: (property: string, value: string) => void;
};

type SafeAreaStore = {
  getState: () => Pick<AppBridgeState, 'safeAreaInsets'>;
  subscribe: (listener: (state: Pick<AppBridgeState, 'safeAreaInsets'>) => void) => () => void;
};

const BRIDGE_FAST_POLL_DURATION_MS = 2_000;
const BRIDGE_STORE_POLL_MS = 250;
const BRIDGE_READY_POLL_MS = 16;

export const applySafeAreaCssVariables = (
  target: CssVariableTarget,
  insets: SafeAreaInsets,
): void => {
  const normalizedInsets = normalizeSafeAreaInsets(insets);

  target.setProperty(SAFE_AREA_CSS_VARIABLES.top, `${normalizedInsets.top}px`);
  target.setProperty(SAFE_AREA_CSS_VARIABLES.right, `${normalizedInsets.right}px`);
  target.setProperty(SAFE_AREA_CSS_VARIABLES.bottom, `${normalizedInsets.bottom}px`);
  target.setProperty(SAFE_AREA_CSS_VARIABLES.left, `${normalizedInsets.left}px`);
};

export const bindSafeAreaCssVariables = (
  store: SafeAreaStore,
  target: CssVariableTarget,
): (() => void) => {
  const applyState = (state: Pick<AppBridgeState, 'safeAreaInsets'>) => {
    applySafeAreaCssVariables(target, state.safeAreaInsets);
  };

  // 먼저 구독한 뒤 읽어 두 동작 사이의 상태 변경도 놓치지 않습니다.
  const unsubscribe = store.subscribe(applyState);
  applyState(store.getState());

  return unsubscribe;
};

const createLinkedBridge = () =>
  linkBridge<AppBridgeStore>({
    initialBridge: {
      safeAreaInsets: INITIAL_SAFE_AREA_INSETS,
    },
    throwOnError: ['getSafeAreaInsets'],
  });

type LinkedAppBridge = ReturnType<typeof createLinkedBridge>;

let linkedBridge: LinkedAppBridge | undefined;

const getLinkedBridge = (): LinkedAppBridge => {
  linkedBridge ??= createLinkedBridge();
  return linkedBridge;
};

/**
 * 네이티브 브리지를 연결하고 루트의 안전 영역 CSS 변수를 최신 상태로 유지합니다.
 * 클라이언트 effect에서 한 번 호출하고 반환된 정리 함수를 사용합니다.
 */
export const installSafeAreaBridge = (target?: CssVariableTarget): (() => void) => {
  if (typeof document === 'undefined') {
    return () => undefined;
  }

  const isReactNativeWebView = typeof window !== 'undefined' && 'ReactNativeWebView' in window;
  if (!isReactNativeWebView) {
    return () => undefined;
  }

  const cssTarget = target ?? document.documentElement.style;
  const bridge = getLinkedBridge();
  let disposed = false;
  let store = bridge.store;
  let unsubscribe = bindSafeAreaCssVariables(store, cssTarget);
  const startedAt = Date.now();
  let timer: ReturnType<typeof setTimeout>;

  // hydration은 store 객체를 교체하지만 공개 구독은 기존 store에 남습니다.
  // 화면이 살아 있는 동안 교체를 확인하고, 늦은 준비에도 다시 연결합니다.
  const observeStore = () => {
    if (disposed) {
      return;
    }
    if (store !== bridge.store) {
      unsubscribe();
      store = bridge.store;
      unsubscribe = bindSafeAreaCssVariables(store, cssTarget);
    }

    // 공유 store가 최신 기준입니다. 별도 RPC 응답으로 최신 inset을 덮지 않습니다.
    const fastPoll =
      !bridge.isNativeMethodAvailable('getSafeAreaInsets') &&
      Date.now() - startedAt < BRIDGE_FAST_POLL_DURATION_MS;
    timer = setTimeout(observeStore, fastPoll ? BRIDGE_READY_POLL_MS : BRIDGE_STORE_POLL_MS);
  };
  observeStore();

  return () => {
    disposed = true;
    clearTimeout(timer);
    unsubscribe();
  };
};
