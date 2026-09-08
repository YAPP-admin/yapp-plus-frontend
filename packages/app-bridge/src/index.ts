import type { BridgeStore } from '@webview-bridge/web';

export type SafeAreaInsets = Readonly<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

export type AppBridgeState = {
  safeAreaInsets: SafeAreaInsets;
  getSafeAreaInsets: () => Promise<SafeAreaInsets>;
};

export type AppBridgeStore = BridgeStore<AppBridgeState>;

export const INITIAL_SAFE_AREA_INSETS: SafeAreaInsets = Object.freeze({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const SAFE_AREA_CSS_VARIABLES = Object.freeze({
  top: '--safe-area-inset-top',
  right: '--safe-area-inset-right',
  bottom: '--safe-area-inset-bottom',
  left: '--safe-area-inset-left',
} as const);

const normalizeInset = (value: number | undefined): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
};

export const normalizeSafeAreaInsets = (
  insets?: Partial<SafeAreaInsets> | null,
): SafeAreaInsets => ({
  top: normalizeInset(insets?.top),
  right: normalizeInset(insets?.right),
  bottom: normalizeInset(insets?.bottom),
  left: normalizeInset(insets?.left),
});
