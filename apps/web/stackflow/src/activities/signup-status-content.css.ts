/** 대기 화면 복귀 확인창을 WebView 화면 중앙에 배치합니다. */
import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: vars.$color.bg.overlay,
  zIndex: 100,
});
export const positioner = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: vars.$dimension.x5,
  zIndex: 101,
});
