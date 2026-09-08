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

const BRIDGE_READY_TIMEOUT_MS = 2_000;
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

const waitForNativeBridge = async (
  bridge: LinkedAppBridge,
  isDisposed: () => boolean,
): Promise<boolean> => {
  const deadline = Date.now() + BRIDGE_READY_TIMEOUT_MS;

  while (
    !isDisposed() &&
    !bridge.isNativeMethodAvailable('getSafeAreaInsets') &&
    Date.now() < deadline
  ) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, BRIDGE_READY_POLL_MS);
    });
  }

  return !isDisposed() && bridge.isNativeMethodAvailable('getSafeAreaInsets');
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
  let unsubscribe = bindSafeAreaCssVariables(bridge.store, cssTarget);

  void (async () => {
    const isReady = await waitForNativeBridge(bridge, () => disposed);
    if (!isReady) {
      return;
    }

    let handshakeInsets: SafeAreaInsets | undefined;
    try {
      handshakeInsets = await bridge.getSafeAreaInsets();
    } catch {
      // 핸드셰이크가 시간 초과되어도 공유 상태를 기준값으로 유지합니다.
    }

    if (disposed) {
      return;
    }

    // 늦게 완료된 브리지 hydration이 저장소를 교체하므로 다시 연결합니다.
    unsubscribe();
    unsubscribe = bindSafeAreaCssVariables(bridge.store, cssTarget);

    if (handshakeInsets) {
      applySafeAreaCssVariables(cssTarget, handshakeInsets);
    }
  })();

  return () => {
    disposed = true;
    unsubscribe();
  };
};
