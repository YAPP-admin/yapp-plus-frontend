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
  padding: '0 16px',
});
