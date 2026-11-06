import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const errorContainer = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100dvh - 190px)',
  width: '100%',
});

export const errorTitle = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t8,
  lineHeight: vars.$lineHeight.t8,
  fontWeight: vars.$fontWeight.bold,
});

export const result = style({
  padding: '32px 0',
});

export const graphic = style({
  display: 'block',
  flexShrink: 0,
  marginBottom: vars.$dimension.x6,
});

export const description = style({
  display: 'block',
  fontSize: vars.$fontSize.t4,
  lineHeight: '20px',
  letterSpacing: '0.203px',
  color: vars.$color.fg.neutralSubtle,
});
