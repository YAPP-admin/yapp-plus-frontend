import { style } from '@vanilla-extract/css';
import { vars } from '@yapp-plus/ui/theme';

export const shell = style({
  minHeight: '100dvh',
});

export const header = style({
  display: 'flex',
  minHeight: '3.5rem',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[6],
  paddingInline: vars.space[6],
  borderBottom: `1px solid ${vars.color.line}`,
  background: vars.color.surface,
});

export const brand = style({
  color: vars.color.foreground,
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: 0,
  textDecoration: 'none',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.color.accent}`,
      outlineOffset: '0.25rem',
    },
  },
});

export const navigation = style({
  display: 'flex',
  alignItems: 'center',
});

export const navigationLink = style({
  display: 'inline-flex',
  minHeight: '2.75rem',
  alignItems: 'center',
  color: vars.color.muted,
  fontSize: '0.875rem',
  fontWeight: 600,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: vars.color.foreground,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.accent}`,
      outlineOffset: '0.125rem',
    },
  },
});
