import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const dialog = style({
  width: 'min(36rem, calc(100vw - 2rem))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 2rem)',
});

export const body = style({
  paddingBlockEnd: vars.$dimension.x6,
  selectors: {
    '&[data-overflow]': {
      paddingBlockEnd: vars.$dimension.x12,
    },
  },
});
