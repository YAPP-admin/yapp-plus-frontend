import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const shell = style({
  minHeight: '100dvh',
});

export const header = style({
  display: 'flex',
  flexWrap: 'wrap',
  minHeight: '3.5rem',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x6,
  paddingInline: vars.$dimension.x6,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  background: vars.$color.bg.layerDefault,
});

export const brand = style({
  display: 'inline-flex',
  minHeight: '2.75rem',
  alignItems: 'center',
  touchAction: 'manipulation',
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: 0,
  textDecoration: 'none',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
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
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  textDecoration: 'none',
  touchAction: 'manipulation',
  selectors: {
    '&[aria-current="page"]': {
      color: vars.$color.fg.neutral,
      textDecoration: 'underline',
      textUnderlineOffset: '0.25em',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
  '@media': {
    '(hover: hover) and (pointer: fine)': {
      selectors: {
        '&:hover': {
          color: vars.$color.fg.neutral,
        },
      },
    },
  },
});
