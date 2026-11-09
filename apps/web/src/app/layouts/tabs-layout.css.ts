/** 탭 연결용 패널이 기존 AppScreen의 스크롤·fixed 요소 기준을 바꾸지 않게 합니다. */
import { style } from '@vanilla-extract/css';

// AppScreen이 스크롤을 소유합니다. transform은 MY 출석 규칙 다이얼로그의 fixed 기준도 바꿉니다.
export const panel = style({
  selectors: {
    '&&': { overflow: 'visible', transform: 'none' },
  },
});
