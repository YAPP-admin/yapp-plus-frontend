import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerDefault,
  minHeight: '100%',
  paddingBottom: '32px',
});

export const profileSection = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '0 20px',
  gap: '2px',
});

export const profileRow = style({
  display: 'flex',
  alignItems: 'center',
  padding: '18px 0',
  gap: '16px',
});

export const avatar = style({
  width: '66px',
  height: '66px',
  borderRadius: '9999px',
  overflow: 'hidden',
  flexShrink: 0,
});

export const profileInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const nameRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const name = style({
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
  borderRadius: '8px',
  background: vars.$color.bg.brandSolid,
  color: '#FFFFFF',
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
});

export const subRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
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
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  borderRadius: '8px',
  overflow: 'hidden',
  background: vars.$color.bg.layerDefault,
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  background: vars.$color.bg.layerFill,
});

export const cardTitleGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
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
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  lineHeight: 1,
});

export const scoreGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
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

export const cardStats = style({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 0',
});

export const statItem = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 0',
  gap: '4px',
});

export const statLabel = style({
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutralMuted,
});

export const statValue = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const sectionDivider = style({
  height: '8px',
  background: vars.$color.bg.layerFill,
  border: 'none',
  margin: 0,
  marginTop: '28px',
  width: '100%',
});

export const menuList = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '0 20px',
  marginTop: '10px',
});

export const menuItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 0',
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
  color: vars.$color.fg.neutralMuted,
  flexShrink: 0,
});
