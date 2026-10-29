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
  height: '54px',
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
  color: '#1A1C20',
  margin: 0,
});

export const headerSpacer = style({
  width: '24px',
  height: '24px',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '0 16px 24px',
  boxSizing: 'border-box',
  gap: '20px',
});

export const uploadArea = style({
  width: '100%',
  height: '206px',
  borderRadius: '12px',
  backgroundColor: '#F3F4F5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  padding: 0,
  fontFamily: 'inherit',
  color: 'inherit',
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
  display: 'block',
});

export const fileInputHidden = style({
  display: 'none',
});

export const memberSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

export const memberHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

export const memberTitle = style({
  fontSize: '18px',
  fontWeight: 700,
  lineHeight: '24px',
  color: '#1A1C20',
  margin: 0,
});

export const memberDescription = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '19px',
  color: '#555D6D',
  margin: 0,
});

export const memberList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  margin: 0,
  padding: 0,
});

export const memberCard = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  boxSizing: 'border-box',
});

export const memberCardChecked = style({
  border: '1px solid #1A1C20',
  backgroundColor: '#FFFFFF',
});

export const memberInfoLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

export const checkboxSquare = style({
  width: '20px',
  height: '20px',
  borderRadius: '4px',
  border: '1.14px solid rgba(0, 0, 0, 0.06)',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  flexShrink: 0,
  transition: 'all 0.15s ease',
});

export const checkboxSquareChecked = style({
  backgroundColor: '#1A1C20',
  borderColor: '#1A1C20',
  color: '#FFFFFF',
});

export const memberTextWrap = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const memberName = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '19px',
  color: '#1A1C20',
  margin: 0,
});

export const memberRole = style({
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '18px',
  color: '#868B94',
  margin: 0,
});

export const meBadge = style({
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '18px',
  color: '#FF6600',
  margin: 0,
});

export const bottomSection = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '12px 16px 20px',
  boxSizing: 'border-box',
  gap: '10px',
});

export const confirmButton = style({
  width: '100%',
  height: '52px',
  borderRadius: '12px !important',
  backgroundColor: '#FF6600 !important',
  color: '#FFFFFF !important',
  fontSize: '16px !important',
  fontWeight: '700 !important',
  lineHeight: '22px !important',
});

export const homeIndicatorArea = style({
  height: '34px',
});
