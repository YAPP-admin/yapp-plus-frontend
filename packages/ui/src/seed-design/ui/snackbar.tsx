/**
 * @file ui:snackbar
 * @requires @seed-design/react@^2.0.0 || ^3.0.0
 **/

'use client';

import {
  Snackbar as SeedSnackbar,
  useSnackbarContext,
  type CreateSnackbarOptions as SeedCreateSnackbarOptions,
} from '@seed-design/react';
import * as React from 'react';

import IconCheckmarkCircleFill from '@karrotmarket/react-monochrome-icon/IconCheckmarkCircleFill';
import IconExclamationmarkCircleFill from '@karrotmarket/react-monochrome-icon/IconExclamationmarkCircleFill';

export type SnackbarProviderProps = SeedSnackbar.RootProviderProps;

export const SnackbarProvider = (props: SnackbarProviderProps) => {
  const { children, ...otherProps } = props;
  return (
    <SeedSnackbar.RootProvider {...otherProps}>
      {children}
      <SeedSnackbar.Region>
        <SeedSnackbar.Renderer />
      </SeedSnackbar.Region>
    </SeedSnackbar.RootProvider>
  );
};

export type SnackbarProps = Omit<SeedSnackbar.RootProps, 'children' | 'asChild'> & {
  /**
   * 스낵바에 표시할 메시지
   */
  message: string;

  /**
   * 스낵바에 표시할 액션 버튼의 라벨
   */
  actionLabel?: string;

  /**
   * 액션 버튼 클릭 시 호출되는 콜백
   */
  onAction?: () => void;
};

function getPrefixIcon(variant: string) {
  if (variant === 'positive') {
    return <IconCheckmarkCircleFill />;
  }
  if (variant === 'critical') {
    return <IconExclamationmarkCircleFill />;
  }
  return null;
}

/**
 * @see https://seed-design.io/react/components/snackbar
 */
export const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
  ({ variant = 'default', message, actionLabel, onAction, ...otherProps }, ref) => {
    return (
      <SeedSnackbar.Root ref={ref} variant={variant} {...otherProps}>
        {variant !== 'default' && <SeedSnackbar.PrefixIcon svg={getPrefixIcon(variant)} />}
        <SeedSnackbar.Content>
          <SeedSnackbar.Message>{message}</SeedSnackbar.Message>
          {actionLabel && (
            <SeedSnackbar.ActionButton onClick={onAction}>{actionLabel}</SeedSnackbar.ActionButton>
          )}
        </SeedSnackbar.Content>
        {/* You may implement your own i18n for dismiss label */}
        <SeedSnackbar.HiddenCloseButton>닫기</SeedSnackbar.HiddenCloseButton>
      </SeedSnackbar.Root>
    );
  },
);
Snackbar.displayName = 'Snackbar';

export type CreateSnackbarOptions = SeedCreateSnackbarOptions;

export function useSnackbarAdapter() {
  const api = useSnackbarContext({ strict: false });
  const adapter = React.useMemo(() => {
    if (!api) {
      return {
        visible: false,
        create: (_options: CreateSnackbarOptions) => {},
        dismiss: () => {},
      };
    }
    return {
      visible: api.visible,
      create: (options: CreateSnackbarOptions) => {
        return api.create({
          timeout: options.timeout ?? 4000,
          removeDelay: options.removeDelay ?? 200,
          onClose: options.onClose,
          render: options.render,
          strategy: options.strategy,
        });
      },
      dismiss: () => {
        api.dismiss();
      },
    };
  }, [api]);

  return adapter;
}

export const SnackbarAvoidOverlap = SeedSnackbar.AvoidOverlap;

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
