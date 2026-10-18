/** 날짜·시간 선택 Dialog의 크기와 선택기·작업 버튼 배치를 정의합니다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const picker = style({
  color: vars.$color.fg.neutral,
  paddingInline: vars.$dimension.x6,
  display: 'grid',
  gap: vars.$dimension.x3,
});
export const pickerDialog = style({
  selectors: { '&&': { width: 'min(24rem, calc(100vw - 2rem))', maxWidth: '24rem' } },
  maxHeight: 'calc(100dvh - 2rem)',
  overflowY: 'auto',
});

export const actions = style({
  selectors: { '&&': { flexDirection: 'row' } },
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
});
