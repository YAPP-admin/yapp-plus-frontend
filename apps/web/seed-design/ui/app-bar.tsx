/**
 * @file ui:app-screen
 * @requires @seed-design/react@^2.0.0 || ^3.0.0
 * @requires @seed-design/css@^3.1.0
 * @requires @seed-design/stackflow@^2.1.0
 **/

'use client';

import { IconChevronLeftLine, IconXmarkLine } from '@karrotmarket/react-monochrome-icon'; // "@daangn/react-monochrome-icon"과 동일합니다.
import { VStack } from '@seed-design/react';
import { AppBar as SeedAppBar } from '@seed-design/stackflow';
import { useActions, useActivity } from '@stackflow/react';
import * as React from 'react';

export type AppBarProps = {} & SeedAppBar.RootProps;

export const AppBar = SeedAppBar.Root;

export type AppBarLeftProps = {} & SeedAppBar.LeftProps;

export const AppBarLeft = SeedAppBar.Left;

export type AppBarRightProps = {} & SeedAppBar.RightProps;

export const AppBarRight = SeedAppBar.Right;

export type AppBarSlotProps = {} & SeedAppBar.SlotProps;

export const AppBarSlot = SeedAppBar.Slot;

export type AppBarMainProps = {
  /**
   * The title of the app bar.
   * If children is provided as ReactElement, this prop will be ignored.
   */
  title?: string;

  /**
   * The subtitle of the app bar.
   * If children is provided as ReactElement, this prop will be ignored.
   */
  subtitle?: string;

  ref?: React.Ref<HTMLDivElement>;
} & Omit<SeedAppBar.MainProps, 'asChild'>;

export const AppBarMain = ({ title, subtitle, children, ref, ...otherProps }: AppBarMainProps) => {
  if (React.isValidElement(children)) {
    return (
      <SeedAppBar.Main {...otherProps} ref={ref}>
        {children}
      </SeedAppBar.Main>
    );
  }

  return (
    <SeedAppBar.Main layout={subtitle ? 'withSubtitle' : 'titleOnly'} {...otherProps} ref={ref}>
      <VStack overflowX="auto">
        <SeedAppBar.Title>{children ?? title}</SeedAppBar.Title>
        {subtitle ? <SeedAppBar.Subtitle>{subtitle}</SeedAppBar.Subtitle> : null}
      </VStack>
    </SeedAppBar.Main>
  );
};

export type AppBarIconButtonProps = {
  ref?: React.Ref<HTMLButtonElement>;
} & SeedAppBar.IconButtonProps;

export const AppBarIconButton = SeedAppBar.IconButton;

export type AppBarTextButtonProps = {} & SeedAppBar.TextButtonProps;

export const AppBarTextButton = SeedAppBar.TextButton;

export const AppBarBackButton = ({
  children = <IconChevronLeftLine />,
  onClick,
  ref,
  ...otherProps
}: AppBarIconButtonProps) => {
  const activity = useActivity();
  const actions = useActions();

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);

    if (!e.defaultPrevented) {
      actions.pop();
    }
  };

  if (!activity) {
    return null;
  }
  if (activity.isRoot) {
    return null;
  }

  return (
    <SeedAppBar.IconButton
      ref={ref}
      aria-label="뒤로"
      type="button"
      onClick={handleOnClick}
      {...otherProps}
    >
      {children}
    </SeedAppBar.IconButton>
  );
};

export const AppBarCloseButton = ({
  children = <IconXmarkLine />,
  onClick,
  ref,
  ...otherProps
}: AppBarIconButtonProps) => {
  const activity = useActivity();

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);

    if (!e.defaultPrevented) {
      // you can do something here
    }
  };

  const isRoot = !activity || activity.isRoot;

  if (!isRoot) {
    return null;
  }

  return (
    <AppBarIconButton
      ref={ref}
      aria-label="닫기"
      type="button"
      onClick={handleOnClick}
      {...otherProps}
    >
      {children}
    </AppBarIconButton>
  );
};

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
