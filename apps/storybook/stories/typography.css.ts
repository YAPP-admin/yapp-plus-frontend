import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const sample = style({
  display: 'grid',
  gap: 16,
  maxWidth: 720,
  padding: 24,
  fontSize: vars.$fontSize.t4,
  lineHeight: 1.5,
  overflowWrap: 'anywhere',
});

export const title = style({ margin: 0, fontSize: vars.$fontSize.t8 });
export const weights = style({ display: 'grid', gap: 8 });
export const field = style({ display: 'grid', gap: 8 });
export const input = style({
  minWidth: 0,
  width: '100%',
  padding: 12,
  fontSize: 16,
  color: vars.$color.fg.neutral,
  background: vars.$color.bg.layerBasement,
});
