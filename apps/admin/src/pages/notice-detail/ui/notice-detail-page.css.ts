/** 상세 정보와 탭의 배치·포커스 스타일이다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  minWidth: 0,
  overflowWrap: 'anywhere',
  width: 'min(100%, 70rem)',
  gap: 0,
  marginInline: 'auto',
  padding: `${vars.$dimension.x8} ${vars.$dimension.x6} ${vars.$dimension.x12}`,
});

export const visuallyHidden = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const backLink = style({
  display: 'inline-flex',
  width: 'fit-content',
  minHeight: '2rem',
  alignItems: 'center',
  gap: vars.$dimension.x1,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  textDecoration: 'none',
  touchAction: 'manipulation',
  selectors: {
    '&:hover': { color: vars.$color.fg.neutral, textDecoration: 'underline' },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});

export const link = style({
  color: vars.$color.fg.brand,
  textUnderlineOffset: '0.25em',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});

export const headerSection = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: vars.$dimension.x6,
  paddingBlock: `${vars.$dimension.x5} ${vars.$dimension.x6}`,
  '@media': {
    '(width < 600px)': {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
});

export const detailHeader = style({ display: 'grid', gap: vars.$dimension.x2, minWidth: 0 });

export const metaRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.$dimension.x2,
});

export const metaSeparator = style({
  width: 3,
  height: 3,
  borderRadius: vars.$radius.full,
  background: vars.$color.fg.neutralMuted,
});

export const createdAt = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t10,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t10,
  letterSpacing: '-0.02em',
});

export const headerDescription = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  overflowWrap: 'anywhere',
});

export const tabs = style({
  display: 'inline-flex',
  maxWidth: '100%',
  overflowX: 'auto',
  gap: vars.$dimension.x6,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  selectors: {
    '&:focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: 2 },
  },
});

export const tab = style({
  position: 'relative',
  display: 'inline-flex',
  minHeight: '2.5rem',
  alignItems: 'center',
  paddingInline: vars.$dimension.x1,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.medium,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  touchAction: 'manipulation',
  selectors: {
    '&:hover': { color: vars.$color.fg.neutral },
    '&[aria-current="page"]': {
      color: vars.$color.fg.neutral,
      fontWeight: vars.$fontWeight.bold,
    },
    '&[aria-current="page"]::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      bottom: -1,
      left: 0,
      height: 2,
      background: vars.$color.fg.brand,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});

export const readSummary = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(180px, 1.1fr) minmax(220px, 1.6fr) auto',
  alignItems: 'center',
  gap: vars.$dimension.x6,
  marginTop: vars.$dimension.x6,
  padding: `${vars.$dimension.x5} ${vars.$dimension.x6}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
  '@media': {
    '(width < 760px)': {
      gridTemplateColumns: '1fr',
      gap: vars.$dimension.x4,
    },
  },
});

export const summaryMetric = style({ display: 'grid', gap: vars.$dimension.x2 });

export const summaryLabel = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
});

export const summaryValue = style({
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t2,
});

export const summaryValueNumber = style({
  fontSize: vars.$fontSize.t10,
  lineHeight: vars.$lineHeight.t10,
});

export const summaryProgress = style({ display: 'grid', gap: vars.$dimension.x2 });

export const progress = style({
  display: 'block',
  appearance: 'none',
  width: '100%',
  height: 7,
  border: 0,
  borderRadius: vars.$radius.full,
  overflow: 'hidden',
  background: vars.$color.stroke.neutralMuted,
  color: vars.$color.fg.brand,
  selectors: {
    '&::-webkit-progress-bar': { background: vars.$color.stroke.neutralMuted },
    '&::-webkit-progress-value': { background: vars.$color.fg.brand },
    '&::-moz-progress-bar': { background: vars.$color.fg.brand },
  },
});

export const progressLegend = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x4,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const readDot = style({
  display: 'inline-block',
  width: 6,
  height: 6,
  marginRight: vars.$dimension.x1,
  borderRadius: vars.$radius.full,
  background: vars.$color.fg.brand,
});

export const unreadDot = style({
  display: 'inline-block',
  width: 6,
  height: 6,
  marginRight: vars.$dimension.x1,
  borderRadius: vars.$radius.full,
  background: vars.$color.stroke.neutralMuted,
});

export const notifyButton = style({
  width: 'fit-content',
  whiteSpace: 'nowrap',
  '@media': { '(width < 760px)': { justifySelf: 'start' } },
});

export const readersSection = style({ marginTop: vars.$dimension.x8 });

export const sectionHeading = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: vars.$dimension.x4,
  marginBottom: vars.$dimension.x4,
  '@media': {
    '(width < 600px)': {
      alignItems: 'flex-start',
      flexDirection: 'column',
      gap: vars.$dimension.x1,
    },
  },
});

export const sectionTitle = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t5,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t5,
});

export const sectionDescription = style({
  margin: `${vars.$dimension.x1} 0 0`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const totalCount = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  whiteSpace: 'nowrap',
});

export const bodySection = style({
  display: 'grid',
  gap: vars.$dimension.x4,
  marginTop: vars.$dimension.x10,
  paddingTop: vars.$dimension.x8,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const placeholder = style({
  margin: 0,
  paddingBlock: vars.$dimension.x8,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
});

export const editLink = style({
  display: 'inline-flex',
  width: 'fit-content',
  gap: vars.$dimension.x1,
  whiteSpace: 'nowrap',
});
