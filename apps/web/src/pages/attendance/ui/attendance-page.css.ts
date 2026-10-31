import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '100dvh',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerDefault,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '54px',
  padding: `0 ${vars.$dimension.x4}`,
  background: vars.$color.bg.layerDefault,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const headerTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const headerSpacer = style({
  width: '24px',
  height: '24px',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  padding: `10px ${vars.$dimension.x5} 40px`,
  gap: '40px',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  flex: 1,
});

export const topCardSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const statusCard = style({
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  borderRadius: vars.$radius.r2,
  overflow: 'hidden',
  background: vars.$color.bg.layerDefault,
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.$dimension.x2} ${vars.$dimension.x4}`,
  background: vars.$color.bg.neutralMuted,
  borderRadius: `${vars.$radius.r2} ${vars.$radius.r2} 0 0`,
});

export const cardTitle = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const progressGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const progressLabel = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
});

export const progressValue = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.brand,
});

export const cardStats = style({
  display: 'flex',
  alignItems: 'center',
  padding: vars.$dimension.x1,
  gap: vars.$dimension.x1,
  borderRadius: `0 0 ${vars.$radius.r2} ${vars.$radius.r2}`,
});

export const statItem = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${vars.$dimension.x3} 0`,
  gap: vars.$dimension.x1,
  borderRadius: vars.$radius.r2,
});

export const statLabel = style({
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutralSubtle,
});

export const statValue = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const warningBanner = style({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 14px',
  background: '#F7F8F9',
  borderRadius: vars.$radius.r2,
  gap: '10px',
});

export const warningText = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
});

export const listSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x3,
  flex: 1,
});

export const sectionTitle = style({
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const emptyContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: '0 0 32px',
  gap: '20px',
});

export const emptyText = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.regular,
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
});

export const listContainer = style({
  display: 'flex',
  flexDirection: 'column',
});

export const sessionItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.$dimension.x4} 0`,
  boxSizing: 'border-box',
});

export const sessionName = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const chipBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  flexShrink: 0,
});

export const attendedChip = style([
  chipBase,
  {
    background: vars.$color.bg.neutralMuted,
    color: vars.$color.fg.neutralSubtle,
  },
]);

export const lateChip = style([
  chipBase,
  {
    background: '#FFF7DE',
    color: '#C49725',
  },
]);

export const absentChip = style([
  chipBase,
  {
    background: '#FDF0F0',
    color: '#FA342C',
  },
]);
