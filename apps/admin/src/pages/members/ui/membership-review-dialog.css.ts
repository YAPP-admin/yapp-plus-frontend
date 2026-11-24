/** 가입 승인·신규 회원 등록·가입 거절 Dialog의 화면 전용 스타일입니다. */
import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const matchDialog = style({
  width: 'min(36.25rem, calc(100vw - 2rem))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 2rem)',
});

export const registrationDialog = style({
  width: 'min(32.5rem, calc(100vw - 2rem))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 2rem)',
});

export const rejectionDialog = style({
  width: 'min(28.75rem, calc(100vw - 2rem))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 2rem)',
});

export const body = style({
  display: 'grid',
  gap: vars.$dimension.x5,
  overflowY: 'auto',
});

export const eyebrow = style({
  marginBlockEnd: vars.$dimension.x1,
  color: vars.$color.fg.brand,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: '0.02em',
});

export const rejectionEyebrow = style({
  color: vars.$color.fg.critical,
});

export const requestSummary = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: vars.$dimension.x3,
  margin: 0,
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
});

export const requestSummaryItem = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minWidth: 0,
});

export const requestSummaryLabel = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const requestSummaryValue = style({
  overflowWrap: 'anywhere',
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
});

export const candidateSection = style({
  display: 'grid',
  gap: vars.$dimension.x3,
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
});

export const sectionTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
});

export const sectionCount = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const candidateList = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const candidate = style({
  display: 'grid',
  gridTemplateColumns: 'auto auto minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: vars.$dimension.x3,
  minHeight: '4.25rem',
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  cursor: 'pointer',
});

export const candidateSelected = style({
  borderColor: vars.$color.stroke.brandWeak,
  background: vars.$color.bg.brandWeak,
});

export const radio = style({
  width: '1rem',
  height: '1rem',
  margin: 0,
  accentColor: vars.$color.fg.brand,
});

export const candidateAvatar = style({
  display: 'grid',
  width: '2rem',
  height: '2rem',
  placeItems: 'center',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: '50%',
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const candidateInfo = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minWidth: 0,
});

export const candidateName = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
});

export const candidateMeta = style({
  overflow: 'hidden',
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const candidateStatus = style({
  flexShrink: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const form = style({
  display: 'grid',
  gap: vars.$dimension.x5,
  margin: 0,
});

export const formFields = style({
  display: 'grid',
  gap: vars.$dimension.x5,
  margin: 0,
  padding: 0,
  border: 0,
});

export const footer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
});

export const rejectionInput = style({
  minHeight: '7.5rem',
});

export const rejectionHelper = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x1,
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const rejectionHelperDot = style({
  color: vars.$color.fg.critical,
});

export const characterCount = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  textAlign: 'right',
});

export const error = style({
  margin: 0,
  color: vars.$color.fg.critical,
  fontSize: vars.$fontSize.t1,
});

export const loading = style({
  margin: 0,
  paddingBlock: vars.$dimension.x6,
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

export const readOnlyField = style({
  opacity: 0.72,
});

globalStyle(`${candidate}:focus-within`, {
  outline: `2px solid ${vars.$color.fg.brand}`,
  outlineOffset: 2,
});
