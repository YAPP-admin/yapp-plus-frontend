/**
 * @file ui:pull-to-refresh
 * @requires @seed-design/react@^2.0.0 || ^3.0.0
 **/

'use client';

import { PullToRefresh } from '@seed-design/react';
import type { Ref } from 'react';
import { ProgressCircle } from './progress-circle';

export type PullToRefreshRootProps = {} & PullToRefresh.RootProps;

export const PullToRefreshRoot = PullToRefresh.Root;

export type PullToRefreshIndicatorProps = {
  ref?: Ref<HTMLDivElement>;
} & Omit<PullToRefresh.IndicatorProps, 'children'>;

export const PullToRefreshIndicator = ({ ref, ...otherProps }: PullToRefreshIndicatorProps) => {
  return (
    <PullToRefresh.Indicator ref={ref} {...otherProps}>
      {(props) => <ProgressCircle size="24" tone="neutral" {...props} />}
    </PullToRefresh.Indicator>
  );
};

export type PullToRefreshContentProps = {} & PullToRefresh.ContentProps;

export const PullToRefreshContent = PullToRefresh.Content;

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
