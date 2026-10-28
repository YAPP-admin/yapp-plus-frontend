import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const shell = style({
  display: 'grid',
  minHeight: '100dvh',
  gridTemplateRows: 'auto 1fr',
  background: vars.$color.bg.layerDefault,
  paddingTop: 'var(--safe-area-inset-top, env(safe-area-inset-top, 0px))',
  paddingRight: 'var(--safe-area-inset-right, env(safe-area-inset-right, 0px))',
  paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
  paddingLeft: 'var(--safe-area-inset-left, env(safe-area-inset-left, 0px))',
});

export const header = style({
  display: 'flex',
  minHeight: '3.5rem',
  alignItems: 'center',
  gap: vars.$dimension.x3,
  paddingInline: vars.$dimension.x6,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const wordmark = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: 0,
});

export const shellWithNavigation = style([
  shell,
  {
    gridTemplateRows: 'auto 1fr auto',
    paddingBottom: 0,
  },
]);

// 인증 화면: Figma처럼 흰색(layerDefault) 배경에 구분선이 없는 상단 영역을 사용합니다.
export const shellPlain = style([
  shell,
  {
    background: vars.$color.bg.layerDefault,
  },
]);

export const headerPlain = style([
  header,
  {
    borderBottom: 'none',
  },
]);

export const customHeaderContainer = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  borderBottom: 'none',
});
