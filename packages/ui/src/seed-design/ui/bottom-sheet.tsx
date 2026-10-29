/**
 * @file ui:bottom-sheet
 * @requires @seed-design/react@^2.0.0 || ^3.0.0
 **/

'use client';

import IconXmarkLine from '@karrotmarket/react-monochrome-icon/IconXmarkLine';
import { Icon, BottomSheet as SeedBottomSheet, VisuallyHidden } from '@seed-design/react';
import type * as React from 'react';
import { forwardRef } from 'react';

export type BottomSheetRootProps = SeedBottomSheet.RootProps;

/**
 * @see https://seed-design.io/react/components/bottom-sheet
 */
export const BottomSheetRoot = (props: BottomSheetRootProps) => {
  const { children, ...otherProps } = props;
  return <SeedBottomSheet.Root {...otherProps}>{children}</SeedBottomSheet.Root>;
};

export type BottomSheetTriggerProps = SeedBottomSheet.TriggerProps;

export const BottomSheetTrigger = SeedBottomSheet.Trigger;

export type BottomSheetContentProps = Omit<SeedBottomSheet.ContentProps, 'title' | 'asChild'> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * @default 200
   */
  layerIndex?: number;
  /**
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * @default false
   */
  showHandle?: boolean;
};

export const BottomSheetContent = forwardRef<HTMLDivElement, BottomSheetContentProps>(
  (
    {
      children,
      title,
      description,
      layerIndex = 200,
      showCloseButton = true,
      showHandle = false,
      ...otherProps
    },
    ref,
  ) => {
    const shouldRenderHeader = Boolean(title ?? description);

    return (
      <SeedBottomSheet.Positioner
        style={
          {
            '--layer-index': layerIndex,
          } as Record<string, number>
        }
      >
        <SeedBottomSheet.Backdrop />
        <SeedBottomSheet.Content ref={ref} {...otherProps}>
          {showHandle && <SeedBottomSheet.Handle />}
          {shouldRenderHeader && (
            <SeedBottomSheet.Header>
              {title ? (
                <SeedBottomSheet.Title>{title}</SeedBottomSheet.Title>
              ) : (
                <VisuallyHidden asChild>
                  <SeedBottomSheet.Title>{otherProps['aria-label'] ?? ''}</SeedBottomSheet.Title>
                </VisuallyHidden>
              )}
              {description && (
                <SeedBottomSheet.Description>{description}</SeedBottomSheet.Description>
              )}
            </SeedBottomSheet.Header>
          )}
          {children}
          {showCloseButton && (
            <SeedBottomSheet.CloseButton aria-label="닫기">
              <Icon svg={<IconXmarkLine />} />
            </SeedBottomSheet.CloseButton>
          )}
        </SeedBottomSheet.Content>
      </SeedBottomSheet.Positioner>
    );
  },
);

export type BottomSheetBodyProps = SeedBottomSheet.BodyProps;

export const BottomSheetBody = SeedBottomSheet.Body;

export type BottomSheetFooterProps = SeedBottomSheet.FooterProps;

export const BottomSheetFooter = SeedBottomSheet.Footer;
