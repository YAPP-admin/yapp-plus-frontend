import { style } from '@vanilla-extract/css';

// 피그마 contents: 제목 묶음과 일러스트 사이 160px (SEED dimension 토큰에 없는 값)
export const contents = style({
  gap: '160px',
});

export const illustration = style({
  width: '100%',
  maxWidth: '350px',
  height: 'auto',
  alignSelf: 'center',
});
