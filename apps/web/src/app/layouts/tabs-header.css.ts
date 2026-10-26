import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const homeHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  background: vars.$color.bg.layerBasement,
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
});

export const logoLink = style({
  display: 'inline-flex',
  alignItems: 'center',
});

export const bellButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: vars.$dimension.x6,
  height: vars.$dimension.x6,
  borderRadius: vars.$radius.full,
  color: vars.$color.fg.neutral,
});

export const defaultTitle = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: 0,
});
