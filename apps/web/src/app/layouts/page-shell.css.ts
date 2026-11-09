import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const shell = style({
  minHeight: '100dvh',
  paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
});

export const header = style({
  minHeight: '3.5rem',
  paddingInline: vars.$dimension.x6,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const wordmark = style({
  letterSpacing: 0,
});

export const shellWithNavigation = style([
  shell,
  {
    paddingBottom: 0,
  },
]);

export const headerPlain = style([
  header,
  {
    borderBottom: 'none',
  },
]);

export const customHeaderContainer = style({
  width: '100%',
  borderBottom: 'none',
});
