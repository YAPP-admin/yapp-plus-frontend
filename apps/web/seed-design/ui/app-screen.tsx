/**
 * @file ui:app-screen
 * @requires @seed-design/react@^2.0.0 || ^3.0.0
 **/

'use client';

import { PullToRefreshRoot, PullToRefreshContent, PullToRefreshIndicator } from './pull-to-refresh';
import { AppScreen as SeedAppScreen } from '@seed-design/stackflow';
import { useActions, useActivity } from '@stackflow/react';
import { useEffect, useRef } from 'react';
import type { Ref } from 'react';

export type AppScreenProps = {
  preventSwipeBack?: boolean;
  ref?: Ref<HTMLDivElement>;
} & Omit<SeedAppScreen.RootProps, 'asChild'>;

export const AppScreen = ({
  children,
  onSwipeBackEnd,
  preventSwipeBack,
  ref,
  ...otherProps
}: AppScreenProps) => {
  const actions = useActions();
  const { isRoot } = useActivity();
  const shouldSwipeBack = !isRoot && !preventSwipeBack;

  return (
    <SeedAppScreen.Root
      ref={ref}
      onSwipeBackEnd={({ swiped }) => {
        if (swiped) {
          actions.pop();
        }
        onSwipeBackEnd?.({ swiped });
      }}
      {...otherProps}
    >
      <SeedAppScreen.Dim />
      {children}
      {shouldSwipeBack && <SeedAppScreen.Edge />}
    </SeedAppScreen.Root>
  );
};

export type AppScreenContentProps = {
  ptr?: boolean;

  onPtrReady?: () => void;

  onPtrRefresh?: () => Promise<void>;

  ref?: Ref<HTMLDivElement>;
} & Omit<SeedAppScreen.LayerProps, 'asChild'>;

export const AppScreenContent = ({
  children,
  ptr,
  onPtrReady,
  onPtrRefresh,
  ref,
  ...otherProps
}: AppScreenContentProps) => {
  const activity = useActivity();
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activity.isTop) {
      return () => {};
    }

    const focusLayer = () => layerRef.current?.focus({ preventScroll: true });
    let frame: number | undefined;

    if (typeof requestAnimationFrame === 'function') {
      frame = requestAnimationFrame(focusLayer);
    } else {
      focusLayer();
    }

    return () => {
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }
    };
  }, [activity.isTop]);

  const setLayerRef = (element: HTMLDivElement | null) => {
    layerRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  if (!ptr) {
    return (
      <SeedAppScreen.Layer ref={setLayerRef} {...otherProps}>
        {children}
      </SeedAppScreen.Layer>
    );
  }

  return (
    <PullToRefreshRoot asChild onPtrReady={onPtrReady} onPtrRefresh={onPtrRefresh}>
      <SeedAppScreen.Layer ref={setLayerRef} {...otherProps}>
        <PullToRefreshIndicator />
        <PullToRefreshContent asChild>{children}</PullToRefreshContent>
      </SeedAppScreen.Layer>
    </PullToRefreshRoot>
  );
};

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
