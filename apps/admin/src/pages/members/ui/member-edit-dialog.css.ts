import { style } from '@vanilla-extract/css';

export const dialog = style({
  width: 'min(36rem, calc(100vw - 2rem))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 2rem)',
});
