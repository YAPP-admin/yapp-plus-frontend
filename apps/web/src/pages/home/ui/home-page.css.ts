import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerBasement,
  minHeight: '100%',
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  padding: `14px ${vars.$dimension.x4} 56px`,
  gap: vars.$dimension.x10,
  boxSizing: 'border-box',
});

export const cardsSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x2_5,
});

export const sessionCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x4,
  padding: '18px 20px',
  background: vars.$color.bg.layerDefault,
  borderRadius: vars.$radius.r3,
  boxSizing: 'border-box',
});

export const sessionHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x1,
});

export const locationRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x1,
});

export const locationPin = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.$color.fg.neutralMuted,
});

export const locationText = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
});

export const sessionTitle = style({
  fontSize: '20px',
  lineHeight: '27px',
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const calendarWeek = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 10px',
  boxSizing: 'border-box',
  width: '100%',
});

export const calendarDayItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.$dimension.x1,
  flex: 1,
  paddingBottom: vars.$dimension.x4,
  boxSizing: 'border-box',
  borderRight: '1px dashed rgba(0, 0, 0, 0.06)',
  selectors: {
    '&:last-child': {
      borderRight: 'none',
    },
  },
});

export const calendarDayLabel = style({
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
  fontWeight: vars.$fontWeight.regular,
  color: vars.$color.fg.neutralMuted,
});

export const calendarDateBadge = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: vars.$radius.full,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
});

export const calendarDateBadgeActive = style([
  calendarDateBadge,
  {
    background: '#2A3038',
    color: '#FFFFFF',
  },
]);

export const attendanceButton = style({
  width: '100%',
  height: '44px',
});

export const quickCardsGrid = style({
  display: 'flex',
  gap: vars.$dimension.x2_5,
  width: '100%',
});

export const quickCard = style({
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '2px',
  padding: '14px 20px',
  minHeight: '80px',
  background: vars.$color.bg.layerDefault,
  borderRadius: vars.$radius.r3,
  textDecoration: 'none',
  boxSizing: 'border-box',
  transition: 'background-color 150ms ease, transform 100ms ease',
  selectors: {
    '&:active': {
      background: vars.$color.bg.layerDefaultPressed,
      transform: 'scale(0.98)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.neutral}`,
      outlineOffset: '2px',
    },
  },
});

export const quickCardTitle = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const quickCardSubtitle = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  margin: 0,
});

export const quickCardGraphic = style({
  position: 'absolute',
  right: '-16px',
  bottom: '-12px',
  width: '110px',
  height: '78px',
  pointerEvents: 'none',
  userSelect: 'none',
});

export const noticesSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x3,
});

export const noticesHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const noticesSectionTitle = style({
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const noticesList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x2_5,
});

export const noticeCard = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px 14px 20px',
  background: vars.$color.bg.layerDefault,
  borderRadius: vars.$radius.r3,
  textDecoration: 'none',
  boxSizing: 'border-box',
  gap: vars.$dimension.x2,
  transition: 'background-color 150ms ease, transform 100ms ease',
  selectors: {
    '&:active': {
      background: vars.$color.bg.layerDefaultPressed,
      transform: 'scale(0.99)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.neutral}`,
      outlineOffset: '2px',
    },
  },
});

export const noticeContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x2,
  minWidth: 0,
});

export const chipRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x1_5,
});

export const chip = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
});

export const chipBlue = style([
  chip,
  {
    background: '#EFF6FF',
    color: '#5E98FE',
  },
]);

export const chipGray = style([
  chip,
  {
    background: '#F3F4F5',
    color: '#555D6D',
  },
]);

export const noticeTitle = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: '#555D6D',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const noticeChevron = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.$color.fg.neutralMuted,
  flexShrink: 0,
});

export const devRoutesLink = style({
  fontSize: vars.$fontSize.t3,
  color: vars.$color.fg.neutralMuted,
  textAlign: 'center',
  padding: vars.$dimension.x2,
  textDecoration: 'underline',
});
