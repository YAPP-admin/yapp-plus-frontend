import { describe, expect, it, vi } from 'vitest';

import { INITIAL_SAFE_AREA_INSETS, normalizeSafeAreaInsets, type AppBridgeState } from '../src';
import {
  applySafeAreaCssVariableFallbacks,
  applySafeAreaCssVariables,
  bindSafeAreaCssVariables,
} from '../src/web';

// iPhone 15 Pro 세로 모드의 native 응답을 재현하는 테스트 fixture입니다.
const IPHONE_15_PRO_PORTRAIT_INSETS = {
  top: 59,
  right: 0,
  bottom: 34,
  left: 0,
} as const;

describe('normalizeSafeAreaInsets', () => {
  it('uses zero for missing, negative, and non-finite values', () => {
    expect(
      normalizeSafeAreaInsets({
        top: 12,
        right: -1,
        bottom: Number.NaN,
        left: Number.POSITIVE_INFINITY,
      }),
    ).toEqual({ top: 12, right: 0, bottom: 0, left: 0 });
    expect(normalizeSafeAreaInsets()).toEqual(INITIAL_SAFE_AREA_INSETS);
  });
});

describe('safe-area CSS adapter', () => {
  it('writes all four values in pixels', () => {
    const setProperty = vi.fn<(property: string, value: string) => void>();

    applySafeAreaCssVariables({ setProperty }, IPHONE_15_PRO_PORTRAIT_INSETS);

    expect(setProperty.mock.calls).toEqual([
      ['--safe-area-inset-top', '59px'],
      ['--safe-area-inset-right', '0px'],
      ['--safe-area-inset-bottom', '34px'],
      ['--safe-area-inset-left', '0px'],
      ['--seed-safe-area-top', '59px'],
      ['--seed-safe-area-right', '0px'],
      ['--seed-safe-area-bottom', '34px'],
      ['--seed-safe-area-left', '0px'],
    ]);
  });

  it('브리지 응답 전에는 WebKit 환경 변수를 양쪽 CSS 계약에 사용한다', () => {
    const setProperty = vi.fn<(property: string, value: string) => void>();

    applySafeAreaCssVariableFallbacks({ setProperty });

    expect(setProperty.mock.calls).toEqual([
      ['--safe-area-inset-top', 'env(safe-area-inset-top, 0px)'],
      ['--safe-area-inset-right', 'env(safe-area-inset-right, 0px)'],
      ['--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)'],
      ['--safe-area-inset-left', 'env(safe-area-inset-left, 0px)'],
      ['--seed-safe-area-top', 'env(safe-area-inset-top, 0px)'],
      ['--seed-safe-area-right', 'env(safe-area-inset-right, 0px)'],
      ['--seed-safe-area-bottom', 'env(safe-area-inset-bottom, 0px)'],
      ['--seed-safe-area-left', 'env(safe-area-inset-left, 0px)'],
    ]);
  });

  it('applies the current state, follows changes, and unsubscribes', () => {
    type Snapshot = Pick<AppBridgeState, 'safeAreaInsets'>;

    let state: Snapshot = { safeAreaInsets: INITIAL_SAFE_AREA_INSETS };
    let listener: ((nextState: Snapshot) => void) | undefined;
    const setProperty = vi.fn<(property: string, value: string) => void>();
    const unsubscribe = bindSafeAreaCssVariables(
      {
        getState: () => state,
        subscribe: (nextListener) => {
          listener = nextListener;
          return () => {
            listener = undefined;
          };
        },
      },
      { setProperty },
    );

    expect(setProperty).toHaveBeenCalledTimes(8);

    state = {
      safeAreaInsets: { top: 20, right: 1, bottom: 10, left: 2 },
    };
    listener?.(state);
    expect(setProperty).toHaveBeenLastCalledWith('--seed-safe-area-left', '2px');

    unsubscribe();
    expect(listener).toBeUndefined();
  });
});
