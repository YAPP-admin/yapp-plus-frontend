import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
});

// 피그마 Sign-up_1·2: 제목과 입력창 사이 40px
export const fields = style({
  gap: vars.$dimension.x10,
});
