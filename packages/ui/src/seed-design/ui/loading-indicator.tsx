/**
 * @file ui:loading-indicator
 * @requires @seed-design/react@^2.0.0
 * @requires @seed-design/css@^2.0.0
 **/

'use client';

import { LoadingIndicator as SeedLoadingIndicator } from '@seed-design/react';
import type { ComponentProps, ReactNode } from 'react';
import { ProgressCircle } from './progress-circle';

export type LoadingIndicatorProps = Omit<
  ComponentProps<typeof SeedLoadingIndicator>,
  'indicator'
> & {
  indicator?: ReactNode;
};

/** @see https://seed-design.io/react/components/loading-indicator */
export function LoadingIndicator({
  children,
  indicator = <ProgressCircle size="inherit" tone="inherit" />,
  ...otherProps
}: LoadingIndicatorProps) {
  return (
    <SeedLoadingIndicator indicator={indicator} {...otherProps}>
      {children}
    </SeedLoadingIndicator>
  );
}

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
