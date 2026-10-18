import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

// 피그마 Yapp-Graphic: 제목 아래 남은 높이의 가운데에 일러스트를 둡니다.
export const graphic = style({
  display: 'flex',
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: vars.$dimension.x5,
});

export const illustration = style({
  width: '100%',
  height: 'auto',
});
