/** 팀 상세 패널과 변경 예정 영역의 레이아웃·상호작용 스타일을 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const panel = style({
  width: 'min(36rem, 100vw)',
  maxWidth: '100%',
});

export const body = style({
  display: 'grid',
  gap: vars.$dimension.x6,
  minHeight: 0,
  overflowY: 'auto',
});

export const summary = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
});

export const summaryRow = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
});

export const summaryLabel = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const summaryValue = style({
  minWidth: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  textAlign: 'right',
  overflowWrap: 'anywhere',
});

export const section = style({
  display: 'grid',
  gap: vars.$dimension.x3,
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
});

export const sectionTitle = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
});

export const partSummary = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x1_5,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const memberList = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const memberItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  minWidth: 0,
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
});

export const memberInfo = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  flex: '1 1 auto',
  minWidth: 0,
});

export const memberName = style({
  minWidth: 0,
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
  overflowWrap: 'anywhere',
});

export const memberMeta = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
});

export const memberAction = style({
  selectors: {
    '&&': {
      flexShrink: 0,
      minWidth: '9rem',
      minHeight: '2.75rem',
      width: 'auto',
      '@media': {
        '(width < 480px)': { minWidth: '7rem' },
      },
    },
  },
});

export const addArea = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
});

export const candidateList = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  maxHeight: '12rem',
  overflowY: 'auto',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const candidateButton = style({
  display: 'grid',
  width: '100%',
  gap: vars.$dimension.x1,
  padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerFloating,
  color: vars.$color.fg.neutral,
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  ':hover': { background: vars.$color.bg.brandWeak },
});

export const emptyMessage = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const feedback = style({
  margin: 0,
  color: vars.$color.fg.critical,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const pendingSection = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.brandWeak}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.brandWeak,
});

export const pendingList = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const pendingItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  minWidth: 0,
});

export const pendingText = style({
  display: 'grid',
  gap: vars.$dimension.x0_5,
  minWidth: 0,
});

export const pendingName = style({
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
  overflowWrap: 'anywhere',
});

export const pendingMeta = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
});

export const footer = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
});
