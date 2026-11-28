/** 마이페이지 로딩의 자리와 reduced motion을 유지하며 다른 화면의 SEED 스타일은 바꾸지 않습니다. */
import { style } from '@vanilla-extract/css';

export const placeholder = style({
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      '::after': { display: 'none' },
    },
  },
});

export const avatarFrame = style({ width: 66, height: 66, flexShrink: 0 });

export const avatarPlaceholder = style([placeholder, { flexShrink: 0 }]);
