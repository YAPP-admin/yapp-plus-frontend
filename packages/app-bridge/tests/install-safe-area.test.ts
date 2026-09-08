import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { INITIAL_SAFE_AREA_INSETS, type AppBridgeState } from '../src';

const { linkBridgeMock } = vi.hoisted(() => ({
  linkBridgeMock: vi.fn<(options?: unknown) => unknown>(),
}));

vi.mock('@webview-bridge/web', () => ({
  linkBridge: linkBridgeMock,
}));

type Snapshot = Pick<AppBridgeState, 'safeAreaInsets'>;
type StoreListener = (state: Snapshot) => void;

const createStore = (state: Snapshot) => {
  let listener: StoreListener | undefined;
  const unsubscribe = vi.fn<() => void>(() => {
    listener = undefined;
  });

  return {
    store: {
      getState: () => state,
      subscribe: (nextListener: StoreListener) => {
        listener = nextListener;
        return unsubscribe;
      },
    },
    emit: (nextState: Snapshot) => listener?.(nextState),
    hasListener: () => listener !== undefined,
    unsubscribe,
  };
};

describe('installSafeAreaBridge', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    linkBridgeMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('일반 브라우저에서는 CSS 변수를 덮어쓰지 않는다', async () => {
    const setProperty = vi.fn<(property: string, value: string) => void>();
    vi.stubGlobal('document', { documentElement: { style: { setProperty } } });
    vi.stubGlobal('window', {});

    const { installSafeAreaBridge } = await import('../src/web');
    const cleanup = installSafeAreaBridge();

    expect(linkBridgeMock).not.toHaveBeenCalled();
    expect(setProperty).not.toHaveBeenCalled();
    expect(cleanup).not.toThrow();
  });

  it('WebView 준비 후 hydration된 저장소를 다시 구독하고 해제한다', async () => {
    const initialStore = createStore({ safeAreaInsets: INITIAL_SAFE_AREA_INSETS });
    const hydratedStore = createStore({
      safeAreaInsets: { top: 47, right: 0, bottom: 34, left: 0 },
    });
    const handshakeInsets = { top: 48, right: 1, bottom: 35, left: 2 };
    const getSafeAreaInsets = vi
      .fn<() => Promise<typeof handshakeInsets>>()
      .mockResolvedValue(handshakeInsets);
    let nativeBridgeReady = false;
    const bridge = {
      store: initialStore.store,
      isNativeMethodAvailable: vi.fn<(method: string) => boolean>(() => nativeBridgeReady),
      getSafeAreaInsets,
    };
    linkBridgeMock.mockReturnValue(bridge);

    const setProperty = vi.fn<(property: string, value: string) => void>();
    vi.stubGlobal('document', { documentElement: { style: { setProperty } } });
    vi.stubGlobal('window', {
      ReactNativeWebView: { postMessage: vi.fn<(message: string) => void>() },
    });

    const { installSafeAreaBridge } = await import('../src/web');
    const cleanup = installSafeAreaBridge();

    expect(initialStore.hasListener()).toBe(true);
    expect(setProperty).toHaveBeenCalledTimes(4);
    expect(getSafeAreaInsets).not.toHaveBeenCalled();

    initialStore.emit({ safeAreaInsets: { top: 20, right: 1, bottom: 10, left: 2 } });
    expect(setProperty).toHaveBeenLastCalledWith('--safe-area-inset-left', '2px');

    bridge.store = hydratedStore.store;
    nativeBridgeReady = true;
    await vi.advanceTimersByTimeAsync(16);

    expect(getSafeAreaInsets).toHaveBeenCalledOnce();
    expect(initialStore.unsubscribe).toHaveBeenCalledOnce();
    expect(initialStore.hasListener()).toBe(false);
    expect(hydratedStore.hasListener()).toBe(true);
    expect(setProperty).toHaveBeenLastCalledWith('--safe-area-inset-left', '2px');

    hydratedStore.emit({ safeAreaInsets: { top: 50, right: 3, bottom: 36, left: 4 } });
    expect(setProperty).toHaveBeenLastCalledWith('--safe-area-inset-left', '4px');

    cleanup();
    expect(hydratedStore.unsubscribe).toHaveBeenCalledOnce();
    expect(hydratedStore.hasListener()).toBe(false);
  });

  it('준비 대기 중 해제하면 네이티브 호출을 시작하지 않는다', async () => {
    const initialStore = createStore({ safeAreaInsets: INITIAL_SAFE_AREA_INSETS });
    const getSafeAreaInsets = vi.fn<() => void>();
    linkBridgeMock.mockReturnValue({
      store: initialStore.store,
      isNativeMethodAvailable: vi.fn<(method: string) => boolean>(() => false),
      getSafeAreaInsets,
    });

    const setProperty = vi.fn<(property: string, value: string) => void>();
    vi.stubGlobal('document', { documentElement: { style: { setProperty } } });
    vi.stubGlobal('window', {
      ReactNativeWebView: { postMessage: vi.fn<(message: string) => void>() },
    });

    const { installSafeAreaBridge } = await import('../src/web');
    const cleanup = installSafeAreaBridge();
    cleanup();
    await vi.advanceTimersByTimeAsync(16);

    expect(initialStore.unsubscribe).toHaveBeenCalledOnce();
    expect(getSafeAreaInsets).not.toHaveBeenCalled();
  });
});
