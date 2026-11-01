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
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
});

export const actions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
});

export const section = style({
  display: 'grid',
  gap: vars.$dimension.x4,
  padding: vars.$dimension.x5,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$dimension.x3,
  background: vars.$color.bg.layerFloating,
});

export const sectionTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t5,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t5,
});

export const dropzone = style({
  display: 'grid',
  justifyItems: 'center',
  gap: vars.$dimension.x2,
  padding: vars.$dimension.x4,
  border: `1px dashed ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$dimension.x2,
  textAlign: 'center',
  touchAction: 'manipulation',
});

export const triggerContainer = style({
  justifyContent: 'center',
  overflow: 'visible',
  padding: 0,
  margin: 0,
});

export const dropzoneDescription = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const fileName = style({
  margin: 0,
  overflowWrap: 'anywhere',
  fontWeight: vars.$fontWeight.bold,
});

export const status = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  margin: 0,
  padding: vars.$dimension.x3,
  borderRadius: vars.$dimension.x2,
  background: vars.$color.bg.neutralWeak,
});

export const statusError = style({
  color: vars.$color.fg.critical,
});

export const summary = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x3,
  margin: 0,
  color: vars.$color.fg.neutralMuted,
});

export const returnLink = style({
  display: 'inline-flex',
  width: 'fit-content',
  minHeight: '2.75rem',
  alignItems: 'center',
  color: vars.$color.fg.brand,
  textUnderlineOffset: '0.25em',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});
