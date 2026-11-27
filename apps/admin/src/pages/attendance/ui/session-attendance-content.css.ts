import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const card = style({
  padding: vars.$dimension.x5,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.neutralWeak,
});
export const heading = style({
  margin: 0,
  fontSize: vars.$fontSize.t5,
  fontWeight: vars.$fontWeight.bold,
});
export const secondary = style({
  display: 'block',
  marginTop: vars.$dimension.x1,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
});
export const inlineControl = style({ display: 'inline-flex', alignItems: 'center' });
export const attendanceSelect = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x2,
  minHeight: '2.75rem',
  maxWidth: '18rem',
  padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
    '&[data-state="open"]': {
      borderColor: vars.$color.fg.brand,
    },
    '&:disabled, &[aria-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
});
export const attendanceTriggerValue = style({
  display: 'inline-flex',
  minWidth: 0,
  alignItems: 'center',
  gap: vars.$dimension.x2,
  fontWeight: vars.$fontWeight.bold,
});
export const attendanceTriggerScore = style({
  flexShrink: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  fontVariantNumeric: 'tabular-nums',
});
export const attendanceOption = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.$dimension.x2,
});
export const attendanceStatusDot = style({
  width: '0.75rem',
  height: '0.75rem',
  flexShrink: 0,
  border: '1px solid rgba(80, 88, 96, 0.28)',
  borderRadius: '50%',
});
export const attendanceStatusDotUndecided = style({ background: '#cfd5dc' });
export const attendanceStatusDotPresent = style({ background: '#d5edb5' });
export const attendanceStatusDotLateOneHour = style({ background: '#ffc6a5' });
export const attendanceStatusDotLateThreeHours = style({ background: '#b9ddef' });
export const attendanceStatusDotAbsent = style({ background: '#f4c5c1' });
export const attendanceStatusDotEarlyLeaveOneHour = style({ background: '#d9c4eb' });
export const attendanceStatusDotEarlyLeaveThreeHours = style({ background: '#e1e6e9' });
export const attendanceStatusDotUnauthorizedLateOneHour = style({ background: '#8a4600' });
export const attendanceStatusDotUnauthorizedLateThreeHours = style({ background: '#0e63ad' });
export const attendanceStatusDotUnauthorizedAbsent = style({ background: '#c50000' });
export const attendanceStatusDotUnauthorizedEarlyLeaveOneHour = style({ background: '#d0d8e2' });
export const attendanceStatusDotUnauthorizedEarlyLeaveThreeHours = style({ background: '#aebacc' });
export const attendanceStatusDotLateOneHourAndEarlyLeaveOneHour = style({
  background: '#d0d8e2',
});
export const attendanceStatusDotLateThreeHoursAndEarlyLeaveOneHour = style({
  background: '#aebacc',
});
export const attendanceStatusDotLateOneHourAndEarlyLeaveThreeHours = style({
  background: '#8799b1',
});
export const attendanceStatusDotLateThreeHoursAndEarlyLeaveThreeHours = style({
  background: '#969b9f',
});
export const attendancePicker = style({
  width: 'min(25rem, calc(100vw - 2rem))',
  maxHeight: 'min(36rem, calc(100vh - 2rem))',
  overflowY: 'auto',
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.neutralWeak,
  boxShadow: '0 0.75rem 2rem rgba(0, 0, 0, 0.18)',
});
export const attendancePickerHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  marginBottom: vars.$dimension.x4,
});
export const attendancePickerTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t3,
  fontWeight: vars.$fontWeight.bold,
});
export const attendancePickerMember = style({
  display: 'block',
  marginTop: vars.$dimension.x1,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.bold,
});
export const attendancePickerClose = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  flexShrink: 0,
  padding: 0,
  border: 0,
  borderRadius: vars.$radius.r2,
  background: 'transparent',
  color: vars.$color.fg.neutralMuted,
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
    '&:hover': {
      background: vars.$color.bg.layerDefault,
      color: vars.$color.fg.neutral,
    },
  },
});
export const attendancePickerSection = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  marginTop: vars.$dimension.x4,
});
export const attendancePickerSectionLabel = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
});
export const attendanceSingleGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: vars.$dimension.x2,
});
export const attendanceChoice = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto auto',
  alignItems: 'center',
  gap: vars.$dimension.x2,
  minHeight: '3.25rem',
  padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
    '&:hover': {
      borderColor: vars.$color.fg.brand,
    },
  },
});
export const attendanceSingleChoice = style({
  minWidth: 0,
  gridTemplateColumns: '1fr auto',
  gridTemplateRows: 'auto auto',
});
export const attendanceChoiceSelected = style({
  borderColor: vars.$color.fg.brand,
  background: vars.$color.bg.brandWeak,
});
export const attendanceChoiceLabel = style({
  display: 'inline-flex',
  minWidth: 0,
  alignItems: 'center',
  gap: vars.$dimension.x2,
  fontWeight: vars.$fontWeight.bold,
});
export const attendanceChoiceScore = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
});
globalStyle(`${attendanceSingleChoice} ${attendanceChoiceLabel}`, {
  gridColumn: '1 / -1',
  whiteSpace: 'nowrap',
});
globalStyle(`${attendanceSingleChoice} ${attendanceChoiceScore}`, { gridColumn: 1 });
export const attendanceTimeList = style({
  display: 'grid',
  gap: vars.$dimension.x2,
});
export const attendanceTimeRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(5.5rem, 0.7fr) minmax(0, 1.3fr)',
  alignItems: 'center',
  gap: vars.$dimension.x2,
});
export const attendanceTimeLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.$dimension.x2,
  fontWeight: vars.$fontWeight.bold,
});
export const attendanceTimeOptions = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.$dimension.x2,
});
export const attendanceTimeChoice = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x2,
  minHeight: '2.5rem',
  padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
  font: 'inherit',
  cursor: 'pointer',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
    '&:hover': {
      borderColor: vars.$color.fg.brand,
    },
  },
});
export const attendancePickerActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  marginTop: vars.$dimension.x3,
  paddingTop: vars.$dimension.x3,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
export const attendancePickerSelectionCount = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
});
export const historyPanel = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  padding: vars.$dimension.x5,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.neutralWeak,
});
export const historyHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: vars.$dimension.x3,
});
export const historyList = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});
export const summary = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: vars.$dimension.x2,
  marginBottom: 0,
});
export const stat = style({
  padding: vars.$dimension.x3,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
});
export const scroll = style({
  overflowX: 'auto',
  outlineOffset: '2px',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
    },
  },
});
export const tabs = style({
  display: 'flex',
  gap: vars.$dimension.x2,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
export const tab = style({
  minHeight: '2.75rem',
  padding: vars.$dimension.x3,
  border: 0,
  borderBottom: '2px solid transparent',
  background: 'transparent',
  color: vars.$color.fg.neutralMuted,
  font: 'inherit',
  cursor: 'pointer',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});
export const activeTab = style({
  minHeight: '2.75rem',
  padding: vars.$dimension.x3,
  border: 0,
  borderBottom: `2px solid ${vars.$color.fg.brand}`,
  background: 'transparent',
  color: vars.$color.fg.neutral,
  font: 'inherit',
  fontWeight: vars.$fontWeight.bold,
  cursor: 'pointer',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});
export const caption = style({
  textAlign: 'left',
  fontWeight: vars.$fontWeight.bold,
  paddingBlock: vars.$dimension.x4,
});
export const table = style({
  width: '100%',
  minWidth: '42rem',
  borderCollapse: 'separate',
  borderSpacing: '0 0.5rem',
  textAlign: 'left',
  fontSize: vars.$fontSize.t3,
});

globalStyle(`${table} th, ${table} td`, { padding: vars.$dimension.x4 });
globalStyle(`${table} tbody tr`, { background: vars.$color.bg.neutralWeak });
globalStyle(`${table} tbody th`, { borderRadius: '0.75rem 0 0 0.75rem' });
globalStyle(`${table} tbody td:last-child`, { borderRadius: '0 0.75rem 0.75rem 0' });
globalStyle(`${stat} dd`, { margin: '0.5rem 0 0', fontWeight: vars.$fontWeight.bold });
export const sessionActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.$dimension.x2,
  marginTop: vars.$dimension.x4,
});
export const reviewList = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  listStyle: 'none',
  margin: `${vars.$dimension.x4} 0 0`,
  padding: 0,
});
export const reviewCard = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
});
export const reviewMeta = style({ display: 'grid', gap: vars.$dimension.x1 });
export const reviewActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
});
export const photoLink = style({
  display: 'inline-flex',
  minHeight: '2.75rem',
  alignItems: 'center',
  color: vars.$color.fg.brand,
  fontWeight: vars.$fontWeight.bold,
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: '0.125rem',
    },
  },
});
export const codeContent = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.$dimension.x3,
  marginTop: vars.$dimension.x3,
});
export const codeValue = style({
  fontSize: vars.$fontSize.t7,
  letterSpacing: '0.16em',
  fontVariantNumeric: 'tabular-nums',
});
