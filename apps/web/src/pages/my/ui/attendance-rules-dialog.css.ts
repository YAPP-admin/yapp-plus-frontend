import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: vars.$color.bg.overlay,
  zIndex: 100,
});

export const positioner = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `0 ${vars.$dimension.x5}`,
  zIndex: 101,
});

export const content = style({
  width: '100%',
  maxHeight: 'calc(100dvh - 40px)',
  overflowY: 'auto',
  boxShadow: vars.$shadow.s2,
});

export const dottedLine = style({
  flex: 1,
  height: '1px',
  borderBottom: `1px dashed ${vars.$color.stroke.neutralWeak}`,
  minWidth: '8px',
});

export const confirmButton = style({
  width: '100%',
  height: '46px',
  WebkitFontSmoothing: 'auto',
  borderRadius: vars.$radius.r2,
  padding: `0 ${vars.$dimension.x5}`,
});
