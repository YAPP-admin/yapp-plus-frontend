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

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});
