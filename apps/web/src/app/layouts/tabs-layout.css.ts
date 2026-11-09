/** 헤더·메뉴를 고정하고 각 탭 본문이 독립적으로 스크롤합니다. */
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
export const panel = style({
  height: '100%',
  overscrollBehaviorY: 'contain',
});
