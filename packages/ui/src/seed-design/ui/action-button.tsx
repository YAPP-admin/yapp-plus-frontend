/**
 * @file ui:action-button
 * @requires @seed-design/react@^2.0.0
 * @requires @seed-design/css@^2.0.0
 **/

'use client';

import { ActionButton as SeedActionButton } from '@seed-design/react';
import type { ComponentProps } from 'react';
import { LoadingIndicator } from './loading-indicator';

export type ActionButtonProps = ComponentProps<typeof SeedActionButton>;

/**
 * @see https://seed-design.io/react/components/action-button
 * asChild를 사용하면 소비자가 LoadingIndicator를 직접 구성합니다.
 */
export function ActionButton({ loading = false, children, ...otherProps }: ActionButtonProps) {
  return (
    <SeedActionButton loading={loading} {...otherProps}>
      {loading && !otherProps.asChild ? <LoadingIndicator>{children}</LoadingIndicator> : children}
    </SeedActionButton>
  );
}

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
