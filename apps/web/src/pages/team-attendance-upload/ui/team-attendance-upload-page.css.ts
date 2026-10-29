import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '100dvh',
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '56px',
  padding: '0 16px',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const headerTitle = style({
  fontSize: '18px',
  fontWeight: 700,
  lineHeight: '24px',
  color: vars.$color.palette.gray900,
  margin: 0,
});

export const headerSpacer = style({
  width: '40px',
  height: '40px',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '16px 20px 24px',
  boxSizing: 'border-box',
  gap: '24px',
});

export const uploadArea = style({
  width: '100%',
  height: '180px',
  borderRadius: '12px',
  backgroundColor: vars.$color.palette.gray100,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  border: '1px dashed #DCDEE3',
  padding: 0,
  fontFamily: 'inherit',
  color: 'inherit',
  transition: 'border-color 0.2s ease',
  selectors: {
    '&:hover': {
      borderColor: vars.$color.palette.gray400,
    },
  },
});

export const srOnly = style({
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

export const uploadIconWrap = style({
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.$color.palette.gray700,
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
});

export const uploadPromptText = style({
  fontSize: '14px',
  fontWeight: 500,
  color: vars.$color.palette.gray700,
  margin: 0,
});

export const uploadHintText = style({
  fontSize: '12px',
  fontWeight: 400,
  color: vars.$color.palette.gray500,
  margin: 0,
});

export const imagePreview = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const changeImageBadge = style({
  position: 'absolute',
  bottom: '12px',
  right: '12px',
  padding: '6px 12px',
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  color: '#FFFFFF',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
});

export const fileInputHidden = style({
  display: 'none',
});

export const memberSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const memberTitle = style({
  fontSize: '18px',
  fontWeight: 700,
  lineHeight: '25px',
  color: vars.$color.palette.gray900,
  margin: 0,
});

export const memberDescription = style({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '20px',
  color: vars.$color.palette.gray700,
  margin: 0,
});

export const memberList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '8px',
});

export const memberCard = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.$color.palette.gray100,
    },
  },
});

export const memberCardChecked = style({
  border: `1px solid ${vars.$color.palette.gray900}`,
  backgroundColor: '#FFFFFF',
});

export const memberInfoLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const checkboxSquare = style({
  width: '20px',
  height: '20px',
  borderRadius: '4px',
  border: '1.5px solid #BDC1C9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  transition: 'all 0.15s ease',
});

export const checkboxSquareChecked = style({
  backgroundColor: vars.$color.palette.gray900,
  borderColor: vars.$color.palette.gray900,
  color: '#FFFFFF',
});

export const memberTextWrap = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const memberName = style({
  fontSize: '15px',
  fontWeight: 600,
  color: vars.$color.palette.gray900,
  margin: 0,
});

export const memberRole = style({
  fontSize: '13px',
  fontWeight: 400,
  color: vars.$color.palette.gray600,
  margin: 0,
});

export const meBadge = style({
  fontSize: '11px',
  fontWeight: 600,
  color: '#FF6600',
  backgroundColor: '#FFF0E6',
  padding: '2px 6px',
  borderRadius: '4px',
});

export const bottomSection = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '12px 20px 20px',
  boxSizing: 'border-box',
  gap: '8px',
});

export const confirmButton = style({
  width: '100%',
  height: '52px',
  borderRadius: '12px',
});

export const homeIndicatorArea = style({
  height: '24px',
});
