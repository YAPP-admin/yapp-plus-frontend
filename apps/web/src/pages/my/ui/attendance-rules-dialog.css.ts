import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.46)',
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
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
});

export const dottedLine = style({
  flex: 1,
  height: '1px',
  borderBottom: '1px dashed #DCDEE3',
  minWidth: '8px',
});

export const confirmButton = style({
  width: '100%',
  height: '46px',
  WebkitFontSmoothing: 'auto',
  borderRadius: vars.$radius.r2,
  padding: `0 ${vars.$dimension.x5}`,
});
