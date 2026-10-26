/** 목록 헤더의 제목·설명 스타일을 소유한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const header = style({
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'space-between',
  gap: vars.$dimension.x4,
});

export const eyebrow = style({
  margin: `0 0 ${vars.$dimension.x2}`,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.brand,
});

export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t12,
  lineHeight: vars.$lineHeight.t12,
  fontWeight: vars.$fontWeight.bold,
});

export const description = style({
  margin: `${vars.$dimension.x2_5} 0 0`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});
