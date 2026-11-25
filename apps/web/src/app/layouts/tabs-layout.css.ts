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

/** 커뮤니티·알림은 본문이 자체 제목을 소유하므로 공통 헤더 행을 만들지 않습니다. */
export const headerlessShell = style({
  selectors: {
    '&&': {
      height: 'calc(100dvh - var(--seed-safe-area-top, 0px))',
      minHeight: 0,
      gridTemplateRows: 'minmax(0, 1fr) auto',
      overflow: 'hidden',
    },
  },
});
export const panel = style({
  height: '100%',
  overscrollBehaviorY: 'contain',
});
