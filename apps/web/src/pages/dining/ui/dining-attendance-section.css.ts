/** 회식 응답·수정 시트와 응답자 명단의 피그마 간격을 정의합니다. */
import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const surveySection = style({
  borderTop: `8px solid ${vars.$color.bg.layerBasement}`,
  padding: '20px 20px 28px',
});

export const surveyHeading = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: vars.$dimension.x4,
});

export const editButton = style({
  minHeight: '36px',
  margin: '-8px 0 -8px auto',
  padding: '8px 0 8px 12px',
  border: 0,
  background: 'transparent',
  color: vars.$color.fg.neutralSubtle,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.medium,
  lineHeight: vars.$lineHeight.t4,
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.stroke.focusRing}`,
      outlineOffset: '2px',
    },
  },
});

export const roundGroup = style({ marginTop: vars.$dimension.x4 });

export const roundLabel = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.$dimension.x2,
  marginBottom: vars.$dimension.x2,
});

export const attendanceButtons = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.$dimension.x2_5,
});

export const attendanceButton = style({
  height: '49px',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.medium,
  lineHeight: vars.$lineHeight.t4,
});

export const attendanceButtonSelected = style({
  borderColor: vars.$color.stroke.brandWeak,
  background: vars.$color.bg.brandWeak,
  color: vars.$color.fg.brand,
  fontWeight: vars.$fontWeight.bold,
});

export const noticeBox = style({
  marginTop: vars.$dimension.x3,
  padding: `${vars.$dimension.x3} ${vars.$dimension.x3_5}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutral,
});

export const stickyFooter = style({
  position: 'sticky',
  bottom: 0,
  padding: '12px 20px 14px',
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  background: vars.$color.bg.layerDefault,
});

export const submitButton = style({ width: '100%', minHeight: '52px' });

export const answerSummary = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.$dimension.x2_5,
});

export const answerSummaryItem = style({
  display: 'flex',
  height: '52px',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `0 ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
});

export const attendeeSection = style({
  borderTop: `8px solid ${vars.$color.bg.layerBasement}`,
  padding: '20px',
});

export const attendeeFilters = style({
  display: 'flex',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const attendeeFilter = style({
  height: '36px',
  padding: `0 ${vars.$dimension.x3_5}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.full,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.medium,
});

export const attendeeFilterSelected = style({
  borderColor: vars.$color.bg.neutralSolid,
  background: vars.$color.bg.neutralSolid,
  color: vars.$color.fg.onNeutralSolid,
});

export const attendeeFilterCount = style({
  color: vars.$color.fg.neutralSubtle,
  selectors: {
    [`${attendeeFilterSelected} &`]: {
      color: vars.$color.fg.onNeutralSolid,
    },
  },
});

export const attendeeList = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  margin: '16px 0 0',
  padding: 0,
  listStyle: 'none',
});

export const attendee = style({
  display: 'flex',
  minHeight: '40px',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
});

export const attendeeProfile = style({
  display: 'flex',
  minWidth: 0,
  alignItems: 'center',
  gap: vars.$dimension.x3,
});

export const avatar = style({
  display: 'grid',
  width: '40px',
  height: '40px',
  flex: '0 0 auto',
  placeItems: 'center',
  borderRadius: vars.$radius.full,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutralMuted,
});

export const attendeeMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x2,
  color: vars.$color.fg.neutralSubtle,
});

export const attendeeName = style({ display: 'block' });

export const divider = style({
  width: '1px',
  height: '10px',
  background: vars.$color.stroke.neutralWeak,
});

export const meBadge = style({
  padding: '2px 6px',
  borderRadius: vars.$radius.r1,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutralMuted,
});

export const sheetContent = style({
  maxWidth: '393px',
  margin: '0 auto',
  borderRadius: `${vars.$radius.r4} ${vars.$radius.r4} 0 0`,
});

export const sheetBody = style({ padding: '0 20px 20px' });
export const sheetFooter = style({ padding: '0 20px 16px' });
