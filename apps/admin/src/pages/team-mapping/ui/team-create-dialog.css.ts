/** 팀 생성 모달의 입력·회원 선택·푸터 레이아웃을 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const dialog = style({
  width: 'min(38rem, calc(100vw - 2rem))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 2rem)',
});

export const form = style({
  display: 'grid',
  minHeight: 0,
});

export const body = style({
  display: 'grid',
  gap: vars.$dimension.x7,
  overflowY: 'auto',
});

export const fields = style({
  display: 'grid',
  gap: vars.$dimension.x5,
});

export const memberSection = style({
  display: 'grid',
  gap: vars.$dimension.x3,
});

export const memberHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
});

export const memberTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
});

export const memberDescription = style({
  margin: `${vars.$dimension.x1} 0 0`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const memberCount = style({
  flexShrink: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const memberPlaceholder = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minHeight: '7rem',
  alignContent: 'center',
  padding: vars.$dimension.x5,
  border: `1px dashed ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutralMuted,
  textAlign: 'center',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const footer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x3,
});
