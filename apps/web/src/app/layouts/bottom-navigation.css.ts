import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const navigation = style({
  position: 'sticky',
  bottom: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
  background: vars.$color.bg.layerBasement,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const item = style({
  display: 'flex',
  minHeight: '3.5rem',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.$dimension.x2,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  textDecoration: 'none',
  touchAction: 'manipulation',
  selectors: {
    '&[aria-current="page"]': {
      color: vars.$color.fg.neutral,
      fontWeight: vars.$fontWeight.bold,
      boxShadow: `inset 0 2px ${vars.$color.bg.brandSolid}`,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.neutral}`,
      outlineOffset: '-4px',
    },
  },
});
