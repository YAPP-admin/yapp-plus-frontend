import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const navigation = style({
  position: 'sticky',
  bottom: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  paddingTop: vars.$dimension.x2,
  paddingBottom: 'calc(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 6px)',
  background: vars.$color.bg.layerDefault,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  zIndex: 100,
});

export const item = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  padding: `${vars.$dimension.x1} ${vars.$dimension.x2}`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  textDecoration: 'none',
  touchAction: 'manipulation',
  transition: 'color 150ms ease, transform 100ms ease',
  selectors: {
    '&[aria-current="page"]': {
      color: vars.$color.fg.neutral,
    },
    '&:active': {
      transform: 'scale(0.96)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.neutral}`,
      outlineOffset: '-2px',
      borderRadius: vars.$radius.r2,
    },
  },
});

export const iconWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
});

export const itemLabel = style({
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: '-0.2px',
});
