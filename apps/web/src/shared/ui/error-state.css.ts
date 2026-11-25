/** 오류 안내가 좁은 카드에서도 줄바꿈되도록 하고 정적 그림의 비율을 보존한다. */
import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const root = style({
  width: '100%',
  minWidth: 0,
  overflowWrap: 'anywhere',
  padding: `${vars.$dimension.x6} ${vars.$dimension.x4}`,
  flexGrow: 0,
});

export const graphic = style({
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  flexShrink: 0,
  marginBottom: vars.$dimension.x6,
});
