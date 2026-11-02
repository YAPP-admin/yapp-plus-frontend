/** 팀 생성 모달의 회원 검색·후보·선택 목록 스타일을 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const root = style({
  display: 'grid',
  gap: vars.$dimension.x3,
});

export const resultList = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minHeight: '12rem',
  maxHeight: '12rem',
  overflowY: 'auto',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const resultButton = style({
  display: 'grid',
  width: '100%',
  gap: vars.$dimension.x1,
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
  textAlign: 'left',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      background: vars.$color.bg.layerFloating,
    },
    '&[data-highlighted]': {
      borderColor: vars.$color.stroke.brandWeak,
      background: vars.$color.bg.brandWeak,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
  },
});

export const resultName = style({
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
});

export const resultMeta = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
});

export const selectedList = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const selectedItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
});

export const selectedInfo = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minWidth: 0,
});

export const emptyMessage = style({
  minHeight: '12rem',
  margin: 0,
  padding: vars.$dimension.x3,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
  textAlign: 'center',
});
