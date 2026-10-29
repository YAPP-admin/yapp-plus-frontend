import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const bottomBar = style({
  position: 'sticky',
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  background: vars.$color.bg.layerDefault,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderTopLeftRadius: vars.$radius.r1,
  borderTopRightRadius: vars.$radius.r1,
  boxSizing: 'border-box',
  zIndex: 100,
});

export const navigation = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  padding: '8px 20px 4px',
  width: '100%',
  boxSizing: 'border-box',
});

export const item = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  padding: '4px 0',
  color: vars.$color.palette.gray600,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  textDecoration: 'none',
  touchAction: 'manipulation',
  transition: 'color 150ms ease, transform 100ms ease',
  selectors: {
    '&[aria-current="page"]': {
      color: vars.$color.fg.neutralMuted,
      fontWeight: vars.$fontWeight.bold,
    },
    '&:active': {
      transform: 'scale(0.96)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.neutralMuted}`,
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
  fontWeight: 'inherit',
  letterSpacing: '-0.2px',
});

export const homeIndicatorArea = style({
  height: '34px',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  boxSizing: 'content-box',
});
