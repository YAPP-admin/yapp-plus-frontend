/**
 * @file ui:progress-circle
 * @requires @seed-design/react@^2.0.0
 * @requires @seed-design/css@^2.0.0
 **/

'use client';

import { ProgressCircle as SeedProgressCircle } from '@seed-design/react';
import type { ComponentProps } from 'react';

export type ProgressCircleProps = ComponentProps<typeof SeedProgressCircle.Root>;

/** @see https://seed-design.io/react/components/progress-circle */
export function ProgressCircle(props: ProgressCircleProps) {
  return (
    <SeedProgressCircle.Root {...props}>
      <SeedProgressCircle.Track />
      <SeedProgressCircle.Range />
    </SeedProgressCircle.Root>
  );
}

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
