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

export const header = style({
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

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x3,
  marginTop: vars.$dimension.x2,
});

export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t8,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t8,
});

export const meta = style({
  margin: `${vars.$dimension.x2} 0 0`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const metricGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: vars.$dimension.x3,
  '@media': {
    'screen and (max-width: 42rem)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const metricCard = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  minHeight: '5.25rem',
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
});

export const metricLabel = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.medium,
});

export const metricValueRow = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.$dimension.x1,
});

export const metricValue = style({
  fontSize: vars.$fontSize.t8,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t8,
});

export const metricUnit = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
});

export const attending = style({ color: vars.$color.fg.positive });
export const declined = style({ color: vars.$color.fg.critical });
export const unanswered = style({ color: vars.$color.fg.neutralMuted });

export const responseGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(20rem, 0.8fr) minmax(34rem, 1.5fr)',
  gap: vars.$dimension.x4,
  '@media': {
    'screen and (max-width: 72rem)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const section = style({ minWidth: 0 });

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  marginBottom: vars.$dimension.x3,
});

export const sectionTitle = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t4,
});

export const sectionCount = style({
  marginLeft: vars.$dimension.x1,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.regular,
});

export const responseFilters = style({
  display: 'flex',
  gap: vars.$dimension.x1,
});

export const responseFilter = style({
  minHeight: '2rem',
  padding: `0 ${vars.$dimension.x3}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.full,
  background: 'transparent',
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.stroke.focusRing}`,
      outlineOffset: '2px',
    },
  },
});

export const responseFilterActive = style({
  borderColor: vars.$color.bg.neutralSolid,
  background: vars.$color.bg.neutralSolid,
  color: vars.$color.fg.onNeutralSolid,
});

export const tableRegion = style({
  overflowX: 'auto',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const teamTable = style({ minWidth: '25rem' });
export const memberTableRegion = style({
  width: 'fit-content',
  maxWidth: '100%',
});
export const memberTable = style({
  width: 'fit-content',
  minWidth: '44rem',
});

export const responseTimeColumn = style({ width: '7.5rem' });

export const tableHeader = style({
  height: '2.75rem',
  padding: `0 ${vars.$dimension.x3}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralSubtle,
  fontWeight: vars.$fontWeight.medium,
  textAlign: 'left',
  whiteSpace: 'nowrap',
});

export const tableCell = style({
  height: '2.75rem',
  padding: `0 ${vars.$dimension.x3}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralMuted,
  whiteSpace: 'nowrap',
  selectors: {
    'tbody tr:last-child &': { borderBottom: 0 },
  },
});

export const memberName = style({
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
  textAlign: 'left',
});

export const memberStatus = style({
  display: 'inline-flex',
  minWidth: '2.75rem',
  justifyContent: 'center',
  padding: `${vars.$dimension.x1} ${vars.$dimension.x2}`,
  borderRadius: vars.$radius.r1,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
});

export const emptyState = style({
  margin: 0,
  padding: vars.$dimension.x6,
  color: vars.$color.fg.neutralMuted,
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
