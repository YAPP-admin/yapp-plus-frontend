import { style, styleVariants } from '@vanilla-extract/css';

import { vars } from './theme.css';

export const base = style({
  alignItems: 'center',
  border: 0,
  borderRadius: vars.radius.control,
  cursor: 'pointer',
  display: 'inline-flex',
  font: 'inherit',
  fontWeight: 600,
  justifyContent: 'center',
  letterSpacing: 0,
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focus}`,
      outlineOffset: 2,
    },
  },
});

export const size = styleVariants({
  medium: {
    minHeight: 40,
    padding: `0 ${vars.space[3]}`,
  },
  small: {
    minHeight: 32,
    padding: `0 ${vars.space[2]}`,
  },
});

export const variant = styleVariants({
  primary: {
    background: vars.color.accent,
    color: vars.color.surface,
    selectors: {
      '&:hover:not(:disabled)': {
        background: vars.color.accentHover,
      },
    },
  },
  secondary: {
    background: vars.color.surfaceHover,
    color: vars.color.foreground,
    selectors: {
      '&:hover:not(:disabled)': {
        background: vars.color.line,
      },
    },
  },
});
