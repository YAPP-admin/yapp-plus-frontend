import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  boxSizing: 'border-box',
});

export const avatar = style({
  background: vars.$color.bg.neutralMuted,
  overflow: 'hidden',
});

export const name = style({
  minWidth: 0,
  overflowWrap: 'anywhere',
  fontSize: vars.$fontSize.t7,
  lineHeight: vars.$lineHeight.t7,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const activeChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 10px',
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.brandSolid,
  color: vars.$color.fg.onBrandSolid,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
});

export const subText = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
});

export const subDivider = style({
  width: '1px',
  height: '10px',
  background: vars.$color.fg.neutralSubtle,
});

export const attendanceCard = style({
  border: `1px solid ${vars.$color.stroke.neutralSubtle}`,
  overflow: 'hidden',
});

export const cardTitle = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const questionButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  lineHeight: 1,
  color: vars.$color.fg.neutralSubtle,
  transition: 'opacity 150ms ease',
  selectors: {
    '&:hover': {
      opacity: 0.8,
    },
  },
});

export const scoreLabel = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
});

export const scoreValue = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.brand,
});

export const statItem = style({
  flex: 1,
});

export const statLabel = style({
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutralMuted,
  textAlign: 'center',
});

export const statValue = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  textAlign: 'center',
});

export const sectionDivider = style({
  height: vars.$dimension.x2,
  background: vars.$color.bg.neutralMuted,
  border: 'none',
  margin: 0,
  marginTop: vars.$dimension.x7,
  width: '100%',
});

export const menuItem = style({
  textDecoration: 'none',
  color: vars.$color.fg.neutral,
});

export const menuLabel = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const menuChevron = style({
  width: vars.$dimension.x6,
  height: vars.$dimension.x6,
  flexShrink: 0,
});

export const queryNotice = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  color: vars.$color.fg.neutralSubtle,
});
