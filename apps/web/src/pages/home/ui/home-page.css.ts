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

export const sessionHeaderTop = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

export const sessionToggleChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '6px',
  backgroundColor: '#F3F4F5',
  color: '#555D6D',
  fontSize: '11px',
  fontWeight: vars.$fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: '#E5E7EB',
    },
  },
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

export const quickCardCol = style({
  flex: '1 1 0px',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

export const quickCard = style({
  width: '100%',
  height: '70px',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  textAlign: 'left',
  padding: '14px 20px',
  background: vars.$color.bg.layerDefault,
  borderRadius: vars.$radius.r3,
  textDecoration: 'none',
  boxSizing: 'border-box',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: 'inherit',
  margin: 0,
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

export const quickCardContent = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  gap: '2px',
});

export const quickCardTitle = style({
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  textAlign: 'left',
  margin: 0,
});

export const quickCardSubtitle = style({
  fontSize: '13px',
  lineHeight: '18px',
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
  textAlign: 'left',
  margin: 0,
});

export const quickCardGraphicSession = style({
  position: 'absolute',
  right: '-48px',
  bottom: '-32px',
  width: '150px',
  height: '106px',
  pointerEvents: 'none',
  userSelect: 'none',
});

export const quickCardGraphicAttendance = style({
  position: 'absolute',
  right: '-48px',
  bottom: '-35px',
  width: '150px',
  height: '106px',
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
  color: vars.$color.palette.gray400,
  flexShrink: 0,
});

export const attendedBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '4px',
  padding: '2px 4px',
  borderRadius: '4px',
  backgroundColor: '#FFF0E6',
  color: '#FF6600',
  fontSize: '11px',
  fontWeight: 700,
  lineHeight: '13px',
});

export const disabledSessionButton = style({
  width: '100%',
  height: '44px',
  borderRadius: '8px',
  backgroundColor: '#F3F4F5 !important',
  color: '#868B94 !important',
  fontSize: '14px !important',
  fontWeight: '700 !important',
  cursor: 'default',
});

export const attendedSessionButton = style({
  width: '100%',
  height: '44px',
  borderRadius: '8px',
  backgroundColor: '#555D6D !important',
  opacity: 0.5,
  color: '#FFFFFF !important',
  fontSize: '16px !important',
  lineHeight: '22px !important',
  fontWeight: '700 !important',
  cursor: 'default',
});

export const quickCardWrapper = style({
  position: 'relative',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

export const helpBubbleContent = style({
  backgroundColor: '#2A3038 !important',
  padding: '8px 10px !important',
  borderRadius: '8px !important',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
});

export const helpBubbleTitle = style({
  fontSize: '12px !important',
  lineHeight: '16px !important',
  fontWeight: '500 !important',
  color: '#FFFFFF !important',
  textAlign: 'center',
  whiteSpace: 'pre-line',
  margin: 0,
});

export const helpBubbleArrowTip = style({
  fill: '#2A3038 !important',
});

export const sheetContent = style({
  borderTopLeftRadius: '16px !important',
  borderTopRightRadius: '16px !important',
  backgroundColor: '#FFFFFF !important',
  padding: '0 !important',
  boxSizing: 'border-box',
  height: 'auto !important',
  maxHeight: '85vh !important',
  overflowY: 'auto',
});

export const sheetHandleArea = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '14px 10px 10px',
  width: '100%',
  boxSizing: 'border-box',
});

export const sheetHandleBar = style({
  width: '52px',
  height: '4px',
  borderRadius: '9999px',
  backgroundColor: '#F3F4F5',
});

export const sheetContainer = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '0 18px 18px',
  boxSizing: 'border-box',
  gap: '20px',
  width: '100%',
});

export const sheetTopSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '24px',
  width: '100%',
});

export const sheetHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  width: '100%',
});

export const sheetTitle = style({
  fontSize: '20px',
  lineHeight: '27px',
  fontWeight: 700,
  color: '#1A1C20',
  margin: 0,
  textAlign: 'left',
});

export const sheetDescription = style({
  fontSize: '14px',
  lineHeight: '19px',
  fontWeight: 500,
  color: '#555D6D',
  margin: 0,
  textAlign: 'left',
});

export const codeInputsWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  width: '100%',
});

export const codeInputsContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '6px',
});

export const codeInput = style({
  width: '54px',
  height: '54px',
  borderRadius: '12px',
  border: '1px solid #DCDEE3',
  backgroundColor: '#FFFFFF',
  textAlign: 'center',
  fontSize: '18px',
  fontWeight: 700,
  lineHeight: '24px',
  color: '#1A1C20',
  outline: 'none',
  boxSizing: 'border-box',
  padding: 0,
  transition: 'border-color 0.15s ease',
  '::placeholder': {
    color: '#B0B3BA',
    fontSize: '18px',
    fontWeight: 700,
    opacity: 1,
  },
  selectors: {
    '&:focus': {
      borderColor: '#555D6D',
    },
    '&:focus::placeholder': {
      color: 'transparent !important',
      opacity: '0 !important',
    },
  },
});

export const codeInputError = style([
  codeInput,
  {
    borderColor: '#FA342C !important',
    color: '#FA342C',
    selectors: {
      '&:focus': {
        borderColor: '#FA342C !important',
      },
      '&:focus::placeholder': {
        color: 'transparent !important',
        opacity: '0 !important',
      },
    },
  },
]);

export const codeErrorMessage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  fontSize: '13px',
  lineHeight: '18px',
  fontWeight: 500,
  color: '#FA342C',
  margin: 0,
});

export const sheetFooter = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const reportRadioGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  width: '100%',
  margin: 0,
  border: 0,
  padding: 0,
});

export const listRadioItem = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  height: '48px',
  padding: '0 18px',
  borderRadius: '10px',
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  textAlign: 'left',
  appearance: 'none',
  outline: 'none',
  ':hover': {
    backgroundColor: '#FAFBFB',
  },
});

export const listRadioItemSelected = style({
  borderColor: '#1A1C20 !important',
});

export const listRadioLabel = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '19px',
  color: '#1A1C20',
});

export const listRadioCircle = style({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  boxSizing: 'border-box',
  border: '1.2px solid rgba(0, 0, 0, 0.14)',
  backgroundColor: '#FFFFFF',
  flexShrink: 0,
});

export const listRadioCircleSelected = style({
  border: '4.5px solid #1A1C20 !important',
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

export const textareaContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  margin: 0,
});

export const reportSnackbar = style({
  width: 'calc(100% - 32px) !important',
  maxWidth: '361px !important',
  backgroundColor: '#2A3038 !important',
  borderRadius: '8px !important',
  padding: '14px 18px !important',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  boxSizing: 'border-box',
  pointerEvents: 'auto',
});

export const reportTextFieldRoot = style({
  width: '100%',
  margin: 0,
});

export const reportTextFieldTextarea = style({
  width: '100%',
  minHeight: '100px',
  borderRadius: '10px !important',
  border: '1px solid #DCDEE3 !important',
  padding: '12px 14px !important',
  fontSize: '15px !important',
  fontWeight: '500 !important',
  color: '#1A1C20 !important',
  backgroundColor: '#FFFFFF !important',
  resize: 'none',
  boxSizing: 'border-box',
  outline: 'none',
  '::placeholder': {
    color: '#B0B3BA !important',
  },
  selectors: {
    '&:focus': {
      borderColor: '#555D6D !important',
    },
  },
});

export const sessionButtonWrapper = style({
  position: 'relative',
  width: '100%',
});

export const teamSessionButton = style({
  width: '100%',
  height: '44px',
  borderRadius: '8px',
  backgroundColor: '#2A3038 !important',
  color: '#FFFFFF !important',
  fontSize: '14px !important',
  fontWeight: '700 !important',
  cursor: 'pointer',
});

export const sheetPrimaryButton = style({
  width: '100%',
  height: '52px',
  borderRadius: '12px !important',
  backgroundColor: '#FF6600 !important',
  color: '#FFFFFF !important',
  fontSize: '16px !important',
  fontWeight: '700 !important',
});

export const teamRulesList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  margin: 0,
  padding: 0,
  width: '100%',
  listStyle: 'none',
});

export const teamRuleItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  lineHeight: '18px',
  fontWeight: 500,
  color: '#555D6D',
});

export const teamCheckIcon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
});

export const teamGraphicWrap = style({
  width: '100%',
  aspectRatio: '337 / 158',
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

export const teamGraphicImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
});

export const teamButtonsWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '100%',
  marginTop: 0,
});

export const sheetSecondaryButton = style({
  width: '100%',
  height: '52px',
  borderRadius: '8px',
  backgroundColor: '#F3F4F5 !important',
  color: '#868B94 !important',
  fontSize: '16px !important',
  fontWeight: '700 !important',
});
