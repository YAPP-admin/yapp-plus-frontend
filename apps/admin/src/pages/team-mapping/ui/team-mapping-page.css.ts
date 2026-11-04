/** 팀 매핑 팀 빌딩 전 화면의 반응형 레이아웃을 정의한다. */
import { style } from '@vanilla-extract/css';
import { breakpoints } from '@seed-design/css/breakpoints';
import { vars } from '@seed-design/css/vars';

const narrowScreen = `(width < ${breakpoints.lg}px)`;

export const page = style({
  display: 'grid',
  width: 'min(100%, 72rem)',
  gap: vars.$dimension.x8,
  marginInline: 'auto',
  padding: `${vars.$dimension.x10} ${vars.$dimension.x6}`,
  '@media': { [narrowScreen]: { padding: `${vars.$dimension.x8} ${vars.$dimension.x4}` } },
});

export const previewField = style({
  width: 'min(100%, 16rem)',
  justifySelf: 'end',
  '@media': { [narrowScreen]: { width: '100%', justifySelf: 'stretch' } },
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: vars.$dimension.x3,
  width: 'min(100%, 34rem)',
  '@media': { [narrowScreen]: { width: '100%', alignItems: 'stretch' } },
});

export const filterField = style({
  width: 'min(100%, 16rem)',
  '@media': { [narrowScreen]: { width: '100%' } },
});

export const emptyState = style({
  display: 'grid',
  justifyItems: 'center',
  gap: vars.$dimension.x3,
  minHeight: '22rem',
  padding: `${vars.$dimension.x12} ${vars.$dimension.x6}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r4,
  background: vars.$color.bg.layerDefault,
  textAlign: 'center',
});

export const emptyIcon = style({
  display: 'grid',
  placeItems: 'center',
  width: '3.5rem',
  height: '3.5rem',
  borderRadius: vars.$radius.full,
  background: vars.$color.bg.brandWeak,
  color: vars.$color.fg.brand,
});

export const emptyTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
});

export const emptyDescription = style({
  maxWidth: '42ch',
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  textWrap: 'pretty',
});

export const teamListSection = style({
  display: 'grid',
  gap: vars.$dimension.x5,
});

export const listActions = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
});

export const listHeader = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: vars.$dimension.x3,
});

export const listTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
});

export const listSummary = style({
  margin: `${vars.$dimension.x1} 0 0`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
});

export const unassignedSummary = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  padding: `${vars.$dimension.x4} ${vars.$dimension.x5}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
});

export const unassignedSummaryTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
});

export const unassignedSummaryDescription = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const teamGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: vars.$dimension.x3,
});

export const filterEmpty = style({
  minHeight: '16rem',
  display: 'grid',
  alignItems: 'center',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r4,
  background: vars.$color.bg.layerDefault,
});

export const confirmationBanner = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x4,
  padding: vars.$dimension.x5,
  border: `1px solid ${vars.$color.stroke.brandWeak}`,
  borderRadius: vars.$radius.r4,
  background: vars.$color.bg.brandWeak,
  '@media': {
    [narrowScreen]: {
      alignItems: 'stretch',
      flexDirection: 'column',
    },
  },
});

export const confirmationContent = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minWidth: 0,
});

export const confirmationEyebrow = style({
  color: vars.$color.fg.brand,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
});

export const confirmationTitle = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
});

export const confirmationDescription = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});

export const editingDescription = style({
  margin: `${vars.$dimension.x1} 0 0`,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
});
