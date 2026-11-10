import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const screen = style({
  background: vars.$color.bg.layerDefault,
});

export const screenBasement = style({
  background: vars.$color.bg.layerBasement,
});

export const scrollLayer = style({
  minHeight: 0,
});

export const statusBar = style({
  height: 'var(--seed-safe-area-top)',
  pointerEvents: 'none',
});

// padding으로 확보한 safe area와 무관하게 scrollTop 0을 관찰합니다.
export const scrollStart = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  pointerEvents: 'none',
});
