import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const emptyContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '120px 0',
  gap: vars.$dimension.x5,
  width: '100%',
  boxSizing: 'border-box',
});

export const emptyGraphic = style({
  width: '90px',
  height: '74px',
  pointerEvents: 'none',
  userSelect: 'none',
});

export const emptyText = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.regular,
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
});
