import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  minHeight: '100dvh',
  placeItems: 'center',
  padding: `${vars.$dimension.x12} ${vars.$dimension.x6}`,
});

export const content = style({
  display: 'grid',
  width: 'min(100%, 32rem)',
  gap: vars.$dimension.x4,
  justifyItems: 'start',
});

export const errorCode = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
});

export const title = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t7,
  lineHeight: vars.$lineHeight.t7,
  fontWeight: vars.$fontWeight.bold,
  textWrap: 'balance',
});

export const description = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  textWrap: 'pretty',
});

export const returnLink = style({
  display: 'inline-flex',
  minHeight: '2.75rem',
  alignItems: 'center',
  color: vars.$color.fg.brand,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  textDecoration: 'underline',
  textUnderlineOffset: '0.25em',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.25rem',
    },
  },
});
