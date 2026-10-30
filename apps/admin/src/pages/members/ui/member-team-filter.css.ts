import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const notice = style({
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$dimension.x2,
  background: vars.$color.bg.layerFloating,
  color: vars.$color.fg.neutralMuted,
});
