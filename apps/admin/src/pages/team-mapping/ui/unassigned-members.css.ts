/** 미배정 회원의 체크·배정 예정 목록 레이아웃을 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const root = style({
  display: 'grid',
  gap: vars.$dimension.x4,
});

export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: vars.$dimension.x3,
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
});

export const selectionCount = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
});

export const bulkSelect = style({
  width: 'min(100%, 16rem)',
  '@media': { '(width < 480px)': { width: '100%' } },
});

export const list = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const item = style({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) minmax(9rem, auto)',
  alignItems: 'center',
  gap: vars.$dimension.x3,
  minWidth: 0,
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
  '@media': {
    '(width < 640px)': {
      gridTemplateColumns: 'auto minmax(0, 1fr)',
    },
  },
});

export const checkbox = style({
  flexShrink: 0,
});

export const info = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minWidth: 0,
});

export const name = style({
  minWidth: 0,
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
  overflowWrap: 'anywhere',
});

export const meta = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  overflowWrap: 'anywhere',
});

export const history = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
});

export const assignment = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
  minWidth: 0,
  '@media': {
    '(width < 640px)': {
      gridColumn: '2',
      justifyContent: 'stretch',
    },
  },
});

export const memberSelect = style({
  selectors: {
    '&&': {
      minWidth: '9rem',
      minHeight: '2.75rem',
      '@media': {
        '(width < 640px)': { flex: '1 1 auto', minWidth: 0, width: '100%' },
      },
    },
  },
});

export const pending = style({
  flexShrink: 0,
  color: vars.$color.fg.brand,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
  whiteSpace: 'nowrap',
});

export const empty = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minHeight: '12rem',
  placeContent: 'center',
  padding: vars.$dimension.x6,
  border: `1px dashed ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  color: vars.$color.fg.neutralMuted,
  textAlign: 'center',
});

export const emptyTitle = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
});

export const emptyDescription = style({
  margin: 0,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const feedback = style({
  margin: 0,
  color: vars.$color.fg.critical,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});
