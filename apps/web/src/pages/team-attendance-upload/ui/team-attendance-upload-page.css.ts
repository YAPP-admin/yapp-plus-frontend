import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  width: '100%',
  backgroundColor: vars.$color.bg.layerDefault,
  boxSizing: 'border-box',
});

export const header = style({
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
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const headerSpacer = style({
  width: '24px',
  height: '24px',
});

export const body = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '0 16px 24px',
  boxSizing: 'border-box',
});

export const uploadArea = style({
  width: '100%',
  height: '206px',
  borderRadius: '12px',
  backgroundColor: vars.$color.bg.neutralMuted,
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

export const uploadIconWrap = style({
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: vars.$color.palette.staticWhite,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.$color.fg.neutralMuted,
  boxShadow: vars.$shadow.s1,
});

export const uploadPromptText = style({
  fontSize: '14px',
  fontWeight: 500,
  color: vars.$color.fg.neutralMuted,
  margin: 0,
});

export const uploadHintText = style({
  fontSize: '12px',
  fontWeight: 400,
  color: vars.$color.fg.neutralSubtle,
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

export const memberTitle = style({
  fontSize: '18px',
  fontWeight: 700,
  lineHeight: '24px',
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const memberDescription = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '19px',
  color: vars.$color.fg.neutralMuted,
  margin: 0,
});

export const memberList = style({
  margin: 0,
  padding: 0,
});

export const memberCard = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderRadius: '10px',
  border: `1px solid ${vars.$color.stroke.neutralSubtle}`,
  backgroundColor: vars.$color.bg.layerDefault,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  boxSizing: 'border-box',
});

export const memberCardChecked = style({
  border: `1px solid ${vars.$color.stroke.neutralSolid}`,
  backgroundColor: vars.$color.bg.layerDefault,
});

export const memberName = style({
  marginTop: 0,
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '19px',
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const memberRole = style({
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '18px',
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
});

export const meBadge = style({
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '18px',
  color: vars.$color.fg.brand,
  margin: 0,
});

export const bottomSection = style({
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  flexShrink: 0,
  padding: '12px 16px calc(12px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))',
  boxSizing: 'border-box',
});

export const confirmButton = style({
  width: '100%',
  height: '52px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 700,
  lineHeight: '22px',
});

// 기존 카드 규격을 유지하고 SEED의 키보드 포커스·상태 동작을 사용합니다.
export const checkboxControl = style({
  width: '20px',
  height: '20px',
  marginTop: 0,
  borderRadius: '4px',
  border: `1.14px solid ${vars.$color.stroke.neutralSubtle}`,
  backgroundColor: vars.$color.bg.layerDefault,
  selectors: {
    '&&[data-checked]': {
      borderWidth: '1.14px',
      backgroundColor: vars.$color.bg.neutralSolid,
      borderColor: vars.$color.stroke.neutralSolid,
      color: vars.$color.fg.onNeutralSolid,
    },
  },
});

export const checkboxIcon = style({ width: '14px', height: '14px' });
