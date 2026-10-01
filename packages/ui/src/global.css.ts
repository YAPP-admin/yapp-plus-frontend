import { vars } from '@seed-design/css/vars';
import { globalStyle } from '@vanilla-extract/css';

const fontFamily =
  '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

globalStyle('*', {
  boxSizing: 'border-box',
});

globalStyle('html', {
  minHeight: '100%',
  background: vars.$color.bg.layerBasement,
});

// SEED base.css의 :root 기본값보다 우선하도록 앱의 서체를 지정합니다.
globalStyle('html:root', {
  vars: { '--seed-font-family': fontFamily },
});

globalStyle('body', {
  minHeight: '100%',
  margin: 0,
  color: vars.$color.fg.neutral,
  background: vars.$color.bg.layerBasement,
  fontFamily,
  fontSynthesis: 'none',
  letterSpacing: 0,
  textRendering: 'optimizeLegibility',
});

globalStyle('button, input, select, textarea', {
  fontFamily: 'inherit',
});
