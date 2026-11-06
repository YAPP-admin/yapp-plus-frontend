import { style } from '@vanilla-extract/css';

export const placeholder = style({
  '::after': {
    // 로딩 윤곽만 표시하고 반복 애니메이션은 사용하지 않습니다.
    display: 'none',
  },
});
