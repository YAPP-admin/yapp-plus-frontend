import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  width: 'min(100%, 72rem)',
  gap: vars.$dimension.x4,
  marginInline: 'auto',
  padding: `${vars.$dimension.x12} ${vars.$dimension.x6}`,
});
export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t8,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t8,
});
export const description = style({
  margin: 0,
  overflowWrap: 'anywhere',
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
});
export const filter = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  width: 'min(100%, 20rem)',
  marginBlock: vars.$dimension.x4,
  fontSize: vars.$fontSize.t4,
});
export const placeholder = style({
  margin: 0,
  paddingBlock: vars.$dimension.x8,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
});

export const backLink = style({
  display: 'inline-flex',
  width: 'fit-content',
  minHeight: '2.75rem',
  alignItems: 'center',
  color: vars.$color.fg.neutral,
  touchAction: 'manipulation',
  textUnderlineOffset: '0.25em',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});
