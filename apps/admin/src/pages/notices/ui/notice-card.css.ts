/** 데스크톱에서는 한 행, 좁은 화면에서는 정보와 집계를 두 행으로 배치한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const card = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 180px 110px 44px',
  alignItems: 'center',
  gap: vars.$dimension.x6,
  minHeight: 106,
  padding: `${vars.$dimension.x5} ${vars.$dimension.x6}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: 12,
  background: vars.$color.bg.layerFloating,
  '@media': {
    '(width < 1000px)': {
      gridTemplateColumns: 'minmax(0, 1fr) 90px 44px',
      gap: vars.$dimension.x4,
    },
    '(width < 480px)': { padding: vars.$dimension.x4, gap: vars.$dimension.x3 },
  },
});

export const identity = style({
  minWidth: 0,
  '@media': { '(width < 1000px)': { gridColumn: '1 / 3' } },
});

export const heading = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.$dimension.x2,
});

export const title = style({
  minWidth: 0,
  margin: 0,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
  overflowWrap: 'anywhere',
});

export const titleLink = style({
  color: vars.$color.fg.neutral,
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline', textUnderlineOffset: 3 },
  ':focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: 3 },
});

export const meta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
  margin: `${vars.$dimension.x3} 0 0`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  overflowWrap: 'anywhere',
});

/** 읽음·질문 집계에 공통으로 사용하는 보조 문구 표현이다. */
const summaryText = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const reading = style([
  summaryText,
  {
    display: 'grid',
    gap: vars.$dimension.x2,
    minWidth: 0,
  },
]);

export const readingLabel = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: vars.$dimension.x2,
});

export const progress = style({
  display: 'block',
  appearance: 'none',
  width: '100%',
  height: 4,
  border: 0,
  borderRadius: 2,
  overflow: 'hidden',
  background: vars.$color.stroke.neutralMuted,
  color: vars.$color.fg.brand,
  selectors: {
    '&::-webkit-progress-bar': { background: vars.$color.stroke.neutralMuted },
    '&::-webkit-progress-value': { background: vars.$color.fg.brand },
    '&::-moz-progress-bar': { background: vars.$color.fg.brand },
  },
});

export const percentage = style({ textAlign: 'right' });

export const questions = style([
  summaryText,
  {
    display: 'grid',
    gap: 6,
    margin: 0,
    paddingLeft: vars.$dimension.x4,
    borderLeft: `1px solid ${vars.$color.stroke.neutralMuted}`,
    textAlign: 'center',
  },
]);

export const questionCount = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.bold,
});

export const menu = style({
  position: 'relative',
  '@media': { '(width < 1000px)': { gridColumn: 3, gridRow: 1 } },
});

export const menuButton = style({
  minWidth: 44,
  minHeight: 44,
  listStyle: 'none',
  selectors: { '&::-webkit-details-marker': { display: 'none' } },
});

export const menuContent = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 4px)',
  zIndex: 2,
  minWidth: 100,
  padding: vars.$dimension.x1,
  borderRadius: 8,
  background: vars.$color.bg.layerFloating,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  boxShadow: '0 8px 24px #0004',
});
