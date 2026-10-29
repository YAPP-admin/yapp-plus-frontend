import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '100dvh',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerDefault,
  position: 'relative',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '54px',
  padding: `0 ${vars.$dimension.x4}`,
  background: vars.$color.bg.layerDefault,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const headerSpacer = style({
  width: '24px',
  height: '24px',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  padding: `20px ${vars.$dimension.x5} 0`,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  flex: 1,
});

export const titleSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  width: '100%',
});

export const title = style({
  margin: 0,
  fontSize: '24px',
  lineHeight: '32px',
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  letterSpacing: '-0.3px',
});

export const description = style({
  margin: 0,
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.regular,
  color: vars.$color.fg.neutralMuted,
});

export const graphicSection = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 0',
});

export const bottomSection = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const contactButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '76px',
  width: '100%',
  border: 'none',
  background: 'none',
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
  color: '#868B94',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.15s ease',
  ':active': {
    opacity: 0.7,
  },
});

export const homeIndicatorArea = style({
  height: '34px',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  boxSizing: 'content-box',
});
