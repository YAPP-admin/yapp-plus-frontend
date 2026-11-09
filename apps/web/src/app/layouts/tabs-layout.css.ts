/** 헤더·메뉴를 고정하고 각 탭 본문만 스크롤·전환합니다. */
import { style } from '@vanilla-extract/css';

export const tabShell = style({
  selectors: {
    '&&': {
      height: 'calc(100dvh - var(--seed-safe-area-top, 0px))',
      minHeight: 0,
      gridTemplateRows: 'auto minmax(0, 1fr) auto',
      overflow: 'hidden',
    },
  },
});
export const carousel = style({ minWidth: 0, minHeight: 0 });
export const camera = style({
  height: '100%',
  // 슬라이드 배치는 유지해 Embla의 index 계산을 보존합니다. inline transform만 덮어 즉시 이동합니다.
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transform: 'translateX(calc(var(--tab-index) * -100%)) !important',
    },
  },
});
export const panel = style({
  height: '100%',
  overscrollBehaviorY: 'contain',
});
