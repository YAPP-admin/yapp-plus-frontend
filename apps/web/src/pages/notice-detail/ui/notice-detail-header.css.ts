import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '54px',
  padding: `0 ${vars.$dimension.x4}`,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerDefault,
});

export const title = style({
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  letterSpacing: '-0.3px',
});

export const spacer = style({
  width: vars.$dimension.x6,
  height: vars.$dimension.x6,
});
