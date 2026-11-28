/** 여러 조회 화면의 SEED 스켈레톤에서 모션 감소 설정을 공통으로 존중합니다. */
import { style } from '@vanilla-extract/css';

/** 윤곽은 유지하면서 모션 감소 환경에서 shimmer만 제거합니다. */
export const skeletonPlaceholder = style({
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      '::after': { display: 'none' },
    },
  },
});
