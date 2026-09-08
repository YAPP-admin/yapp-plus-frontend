import { createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    accent: null,
    accentHover: null,
    canvas: null,
    focus: null,
    foreground: null,
    line: null,
    muted: null,
    surface: null,
    surfaceHover: null,
  },
  radius: {
    control: null,
  },
  space: {
    2: null,
    3: null,
    4: null,
    6: null,
    8: null,
    12: null,
  },
});
