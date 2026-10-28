import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerDefault,
  minHeight: '100dvh',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  height: '54px',
  padding: `0 ${vars.$dimension.x4}`,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: 1,
  padding: '14px 20px 52px',
  boxSizing: 'border-box',
});

export const titleGroup = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '10px',
  width: '100%',
  marginTop: '20px',
});

export const title = style({
  fontSize: vars.$fontSize.t10,
  lineHeight: vars.$lineHeight.t10,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const description = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.regular,
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
});

export const graphicContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '350px',
  marginBottom: '40px',
});

export const graphic = style({
  width: '100%',
  maxWidth: '350px',
  height: 'auto',
  aspectRatio: '350 / 170',
  pointerEvents: 'none',
  userSelect: 'none',
});
