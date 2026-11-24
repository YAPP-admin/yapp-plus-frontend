/** 팀 생성 모달의 회원 검색·후보·선택 목록 스타일을 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const root = style({
  display: 'grid',
  gap: vars.$dimension.x3,
});

export const searchField = style({
  position: 'relative',
  zIndex: 1,
});

export const resultList = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  position: 'fixed',
  zIndex: 1000,
  maxHeight: '14rem',
  overflowY: 'auto',
  margin: 0,
  padding: vars.$dimension.x1,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
  boxShadow: '0 8px 24px #0004',
  listStyle: 'none',
});

export const resultButton = style({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  alignItems: 'center',
  width: '100%',
  gap: vars.$dimension.x2,
  padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
  border: 0,
  borderRadius: vars.$radius.r2,
  background: 'transparent',
  color: vars.$color.fg.neutral,
  textAlign: 'left',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      background: vars.$color.bg.layerDefault,
    },
    '&[data-highlighted]': {
      background: vars.$color.bg.brandWeak,
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.55,
    },
  },
});

export const resultIcon = style({
  display: 'grid',
  placeItems: 'center',
  width: vars.$dimension.x5,
  height: vars.$dimension.x5,
  border: `1px solid ${vars.$color.stroke.brandWeak}`,
  borderRadius: vars.$radius.full,
  color: vars.$color.fg.brand,
  fontSize: vars.$fontSize.t3,
  lineHeight: 1,
});

export const resultInfo = style({
  display: 'grid',
  minWidth: 0,
  gap: vars.$dimension.x0_5,
});

export const resultIdentity = style({
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
});

export const resultBadges = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: vars.$dimension.x1,
});

export const removeMenuLabel = style({
  color: vars.$color.fg.critical,
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
  position: 'fixed',
  zIndex: 1000,
  margin: 0,
  padding: vars.$dimension.x5,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
  textAlign: 'center',
});
