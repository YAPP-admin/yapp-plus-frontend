import { describe, expect, it, vi } from 'vitest';

import { INITIAL_SAFE_AREA_INSETS, normalizeSafeAreaInsets, type AppBridgeState } from '../src';
import { applySafeAreaCssVariables, bindSafeAreaCssVariables } from '../src/web';

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

    applySafeAreaCssVariables({ setProperty }, { top: 47, right: 0, bottom: 34, left: 0 });

    expect(setProperty.mock.calls).toEqual([
      ['--safe-area-inset-top', '47px'],
      ['--safe-area-inset-right', '0px'],
      ['--safe-area-inset-bottom', '34px'],
      ['--safe-area-inset-left', '0px'],
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

    expect(setProperty).toHaveBeenCalledTimes(4);

    state = {
      safeAreaInsets: { top: 20, right: 1, bottom: 10, left: 2 },
    };
    listener?.(state);
    expect(setProperty).toHaveBeenLastCalledWith('--safe-area-inset-left', '2px');

    unsubscribe();
    expect(listener).toBeUndefined();
  });
});
