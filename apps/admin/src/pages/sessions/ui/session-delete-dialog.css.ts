/** 삭제 확인창의 긴 대상명·작은 화면과 오류 안내 배치를 처리합니다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const content = style({
  maxHeight: 'calc(100dvh - 2rem)',
  overflowY: 'auto',
  overflowWrap: 'anywhere',
});
export const actions = style({
  selectors: { '&&': { flexDirection: 'row' } },
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
});
export const error = style({
  paddingInline: vars.$dimension.x6,
  color: vars.$color.fg.critical,
});
