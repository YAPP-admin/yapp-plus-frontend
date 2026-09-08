import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';

import { vars } from './theme.css';

createGlobalTheme(':root', vars, {
  color: {
    accent: '#087f5b',
    accentHover: '#066c4d',
    canvas: '#f7f8fa',
    focus: '#1971c2',
    foreground: '#1f2933',
    line: 'rgb(31 41 51 / 12%)',
    muted: '#5d6975',
    surface: '#ffffff',
    surfaceHover: '#edf0f2',
  },
  radius: {
    control: '6px',
  },
  space: {
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
  },
});

globalStyle('*', {
  boxSizing: 'border-box',
});

globalStyle('html', {
  minHeight: '100%',
  background: vars.color.canvas,
});

globalStyle('body', {
  minHeight: '100%',
  margin: 0,
  color: vars.color.foreground,
  background: vars.color.canvas,
  fontFamily: 'Inter, Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSynthesis: 'none',
  letterSpacing: 0,
  textRendering: 'optimizeLegibility',
});

globalStyle('button, input, textarea, select', {
  font: 'inherit',
});
