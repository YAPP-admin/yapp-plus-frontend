import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerDefault,
  minHeight: '100%',
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  padding: `10px ${vars.$dimension.x5} 40px`,
  boxSizing: 'border-box',
  width: '100%',
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});
