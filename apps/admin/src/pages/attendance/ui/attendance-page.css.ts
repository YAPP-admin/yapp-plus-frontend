import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  width: 'min(100%, 72rem)',
  gap: vars.$dimension.x4,
  marginInline: 'auto',
  padding: `${vars.$dimension.x12} ${vars.$dimension.x6}`,
});
export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t8,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t8,
});
export const description = style({
  margin: 0,
  overflowWrap: 'anywhere',
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
});
export const filter = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  width: 'min(100%, 20rem)',
  marginBlock: vars.$dimension.x4,
  fontSize: vars.$fontSize.t4,
});
export const placeholder = style({
  margin: 0,
  paddingBlock: vars.$dimension.x8,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
});

export const scoreNotice = style({
  margin: 0,
  padding: vars.$dimension.x4,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
});

export const scoreTableWrap = style({
  overflowX: 'auto',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
});

export const scoreTable = style({
  width: '100%',
  minWidth: '44rem',
  borderCollapse: 'collapse',
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
});

export const scoreHeader = style({
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutralMuted,
  fontWeight: vars.$fontWeight.bold,
  textAlign: 'left',
  whiteSpace: 'nowrap',
});

export const scoreCell = style({
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  verticalAlign: 'top',
});

export const scoreValue = style({
  fontWeight: vars.$fontWeight.bold,
  whiteSpace: 'nowrap',
});

export const scoreWarning = style({
  color: vars.$color.fg.critical,
  fontWeight: vars.$fontWeight.bold,
});

export const scoreDetail = style({
  marginTop: vars.$dimension.x2,
  color: vars.$color.fg.neutralMuted,
});

export const scoreDetailSummary = style({
  width: 'fit-content',
  cursor: 'pointer',
  color: vars.$color.fg.neutral,
  textUnderlineOffset: '0.2em',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});

export const scoreDetailList = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  margin: `${vars.$dimension.x3} 0 0`,
  paddingLeft: vars.$dimension.x4,
});

export const scoreDetailItem = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
});

export const backLink = style({
  display: 'inline-flex',
  width: 'fit-content',
  minHeight: '2.75rem',
  alignItems: 'center',
  color: vars.$color.fg.neutral,
  touchAction: 'manipulation',
  textUnderlineOffset: '0.25em',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});

export const sessionList = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const sessionLink = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  padding: vars.$dimension.x5,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  color: vars.$color.fg.neutral,
  textDecoration: 'none',
  selectors: {
    '&:hover': { background: vars.$color.bg.layerDefault },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});
