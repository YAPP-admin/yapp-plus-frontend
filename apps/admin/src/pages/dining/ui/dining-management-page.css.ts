import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const page = style({
  display: 'grid',
  width: 'min(100%, 72rem)',
  gap: vars.$dimension.x5,
  marginInline: 'auto',
  padding: `${vars.$dimension.x8} ${vars.$dimension.x6} ${vars.$dimension.x12}`,
  '@media': {
    'screen and (max-width: 48rem)': {
      padding: `${vars.$dimension.x8} ${vars.$dimension.x4}`,
    },
  },
});

export const heading = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: vars.$dimension.x6,
  '@media': {
    'screen and (max-width: 48rem)': {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
});

export const eyebrow = style({
  margin: 0,
  color: vars.$color.fg.brand,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: '0.04em',
  lineHeight: vars.$lineHeight.t2,
});

export const title = style({
  margin: `${vars.$dimension.x2} 0 ${vars.$dimension.x1}`,
  fontSize: vars.$fontSize.t8,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t8,
});

export const description = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
});

export const createButton = style({
  minHeight: '2.5rem',
  background: vars.$color.bg.informativeSolid,
  color: vars.$color.fg.onInformativeSolid,
  vars: {
    '--seed-icon-color': vars.$color.fg.onInformativeSolid,
    '--seed-prefix-icon-color': vars.$color.fg.onInformativeSolid,
    '--seed-suffix-icon-color': vars.$color.fg.onInformativeSolid,
  },
  selectors: {
    '&:hover': { background: vars.$color.bg.informativeSolidPressed },
    '&:active': { background: vars.$color.bg.informativeSolidPressed },
  },
});

export const filterGroup = style({
  display: 'flex',
  gap: vars.$dimension.x2,
  marginTop: vars.$dimension.x3,
});

export const filter = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.$dimension.x2,
  minHeight: '2.5rem',
  padding: `0 ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.full,
  background: 'transparent',
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t3,
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.stroke.focusRing}`,
      outlineOffset: '2px',
    },
  },
});

export const filterActive = style({
  borderColor: vars.$color.bg.neutralSolid,
  background: vars.$color.bg.neutralSolid,
  color: vars.$color.fg.onNeutralSolid,
});

export const filterCountLabel = style({ color: vars.$color.fg.brand });

export const tableRegion = style({
  position: 'relative',
  overflowX: 'auto',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
});

export const table = style({
  width: '100%',
  minWidth: '70rem',
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const tableHeader = style({
  height: '3rem',
  padding: `0 ${vars.$dimension.x4}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralSubtle,
  fontWeight: vars.$fontWeight.medium,
  textAlign: 'left',
  whiteSpace: 'nowrap',
});

export const tableCell = style({
  height: '3.125rem',
  padding: `0 ${vars.$dimension.x4}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralMuted,
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
  selectors: {
    'tbody tr:last-child &': { borderBottom: 0 },
  },
});

export const titleCell = style({
  width: '22%',
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
  textAlign: 'left',
});

export const titleLink = style({
  color: 'inherit',
  textDecoration: 'none',
  textUnderlineOffset: '0.2em',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.stroke.focusRing}`,
      outlineOffset: '2px',
    },
  },
});

export const progressGroup = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(4rem, 1fr) 2.25rem',
  alignItems: 'center',
  gap: vars.$dimension.x3,
});

export const progress = style({
  display: 'block',
  width: '100%',
  height: '0.25rem',
  appearance: 'none',
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

export const responseRate = style({
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
  textAlign: 'right',
});

export const emptyState = style({
  margin: 0,
  padding: vars.$dimension.x6,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  textAlign: 'center',
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
