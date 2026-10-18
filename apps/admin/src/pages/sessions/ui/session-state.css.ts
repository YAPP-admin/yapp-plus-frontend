/** 세션 빈 목록과 조회 실패 패널에서 공유하는 배치·타이포그래피를 정의합니다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.$dimension.x4,
  minHeight: '25rem',
  padding: vars.$dimension.x6,
  textAlign: 'center',
  background: vars.$color.bg.layerFloating,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
});
export const icon = style({ marginBottom: vars.$dimension.x4, color: vars.$color.fg.neutralMuted });
export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
});
export const description = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
});

export const message = style({
  display: 'grid',
  gap: vars.$dimension.x4,
});
