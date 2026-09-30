import { vars } from '@seed-design/css/vars';
import { globalStyle } from '@vanilla-extract/css';

globalStyle('*', {
  boxSizing: 'border-box',
});

globalStyle('html', {
  minHeight: '100%',
  background: vars.$color.bg.layerBasement,
});

globalStyle('body', {
  minHeight: '100%',
  margin: 0,
  color: vars.$color.fg.neutral,
  background: vars.$color.bg.layerBasement,
  fontFamily: 'Inter, Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSynthesis: 'none',
  letterSpacing: 0,
  textRendering: 'optimizeLegibility',
});
