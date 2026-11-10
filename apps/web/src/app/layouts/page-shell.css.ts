import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const shell = style({
  height: 'calc(100dvh - var(--seed-safe-area-top, 0px))',
  minHeight: 0,
  paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
  // safe-area padding을 최소 높이에 포함해 하단 CTA가 별도 스크롤 영역으로 밀리지 않게 합니다.
  boxSizing: 'border-box',
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
