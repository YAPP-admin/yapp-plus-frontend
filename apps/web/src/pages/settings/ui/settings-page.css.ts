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
  justifyContent: 'space-between',
  padding: `0 ${vars.$dimension.x5}`,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  flex: 1,
});

export const menuList = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const menuItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '60px',
  padding: '16px 0',
  boxSizing: 'border-box',
  textDecoration: 'none',
  color: vars.$color.fg.neutral,
  border: 'none',
  background: 'none',
  width: '100%',
  cursor: 'pointer',
  textAlign: 'left',
});

export const menuLabel = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
});

export const menuChevron = style({
  width: '24px',
  height: '24px',
  flexShrink: 0,
});

// SEED Design Switch Styles
export const switchRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
});

export const switchControl = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  width: '52px',
  height: '28px',
  padding: '2px',
  borderRadius: vars.$radius.full,
  boxSizing: 'border-box',
  transition: 'background-color 0.2s ease',
  selectors: {
    '&[data-checked="true"]': {
      background: vars.$color.bg.brandSolid,
    },
    '&[data-checked="false"]': {
      background: '#DCDEE3',
    },
  },
});

export const switchThumb = style({
  display: 'block',
  width: '24px',
  height: '24px',
  borderRadius: vars.$radius.full,
  background: '#FFFFFF',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
  transition: 'transform 0.2s ease',
  selectors: {
    [`${switchControl}[data-checked="true"] &`]: {
      transform: 'translateX(24px)',
    },
    [`${switchControl}[data-checked="false"] &`]: {
      transform: 'translateX(0)',
    },
  },
});

export const bottomSection = style({
  display: 'flex',
  flexDirection: 'column',
  padding: `12px 0 34px`,
  width: '100%',
  boxSizing: 'border-box',
});

export const logoutButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '16px 20px',
  borderRadius: '12px',
  border: '1px solid #DCDEE3',
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, transform 0.15s ease',
  ':active': {
    transform: 'scale(0.99)',
    background: vars.$color.bg.neutralMuted,
  },
});

// SEED Design Dialog Styles
export const dialogBackdrop = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.46)',
  zIndex: 100,
});

export const dialogPositioner = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `0 ${vars.$dimension.x5}`,
  zIndex: 101,
});

export const dialogContent = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '290px',
  minWidth: '290px',
  maxWidth: '290px',
  background: vars.$color.bg.layerDefault,
  borderRadius: '16px',
  padding: '16px 20px',
  margin: '0 auto',
  boxSizing: 'border-box',
  gap: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)',
});

export const dialogHeader = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  gap: '4px',
  width: '100%',
  padding: '0 !important',
});

export const dialogTitle = style({
  margin: 0,
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  textAlign: 'left',
  width: '100%',
});

export const dialogDescription = style({
  margin: 0,
  fontSize: '14px',
  lineHeight: '19px',
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  textAlign: 'left',
  width: '100%',
});

export const dialogFooter = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '0 !important',
  boxSizing: 'border-box',
});

export const dialogCancelButton = style({
  flex: '1 1 0',
  width: '100%',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#F3F4F5',
  borderRadius: '8px',
  border: 'none',
  fontSize: '14px',
  lineHeight: '19px',
  fontWeight: vars.$fontWeight.bold,
  color: '#868B94',
  cursor: 'pointer',
  padding: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: 'background-color 0.15s ease',
  ':active': {
    background: '#E5E7EB',
  },
});

export const dialogConfirmButton = style({
  flex: '1 1 0',
  width: '100%',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.$color.bg.brandSolid,
  borderRadius: '8px',
  border: 'none',
  fontSize: '14px',
  lineHeight: '19px',
  fontWeight: vars.$fontWeight.bold,
  color: '#FFFFFF',
  cursor: 'pointer',
  padding: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: 'opacity 0.15s ease',
  ':active': {
    opacity: 0.9,
  },
});
