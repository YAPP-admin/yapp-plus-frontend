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

export const filters = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
  gap: vars.$dimension.x4,
});

export const searchForm = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'end',
  gap: vars.$dimension.x2,
});

export const field = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  fontSize: vars.$fontSize.t4,
});

export const control = style({
  width: '100%',
  minWidth: 0,
  minHeight: '2.75rem',
  paddingInline: vars.$dimension.x3,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$dimension.x2,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
  fontSize: '1rem',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});

export const placeholder = style({
  margin: 0,
  paddingBlock: vars.$dimension.x8,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
});

export const tabs = style({ display: 'flex', flexWrap: 'wrap', gap: vars.$dimension.x4 });

export const tab = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '2.75rem',
  color: vars.$color.fg.neutralMuted,
  textUnderlineOffset: '0.25em',
  touchAction: 'manipulation',
  selectors: {
    '&[aria-current="page"]': { color: vars.$color.fg.neutral, fontWeight: vars.$fontWeight.bold },
    '&:focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: '0.125rem' },
  },
});

export const searchButton = style({ minHeight: '2.75rem' });
