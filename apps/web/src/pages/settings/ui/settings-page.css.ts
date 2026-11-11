import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

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

export const screen = style({
  height: '100%',
});

export const content = style({
  selectors: {
    '&&': {
      flex: '1 1 0',
      minHeight: 0,
    },
  },
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
      background: vars.$color.bg.neutralWeak,
    },
  },
});

export const switchThumb = style({
  display: 'block',
  width: '24px',
  height: '24px',
  borderRadius: vars.$radius.full,
  background: vars.$color.palette.staticWhite,
  boxShadow: vars.$shadow.s1,
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
  padding: '12px 16px',
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
  border: `1px solid ${vars.$color.stroke.neutralWeak}`,
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
  background: vars.$color.bg.overlay,
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
  width: '100%',
  minWidth: 0,
  maxWidth: '290px',
  maxHeight: 'calc(100dvh - 40px)',
  overflowY: 'auto',
  background: vars.$color.bg.layerDefault,
  borderRadius: '16px',
  padding: '16px 20px',
  margin: '0 auto',
  boxSizing: 'border-box',
  gap: '16px',
  boxShadow: vars.$shadow.s2,
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
  background: vars.$color.bg.neutralMuted,
  borderRadius: '8px',
  border: 'none',
  fontSize: '14px',
  lineHeight: '19px',
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutralSubtle,
  cursor: 'pointer',
  padding: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: 'background-color 0.15s ease',
  ':active': {
    background: vars.$color.bg.neutralWeakPressed,
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
  color: vars.$color.fg.onBrandSolid,
  cursor: 'pointer',
  padding: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: 'opacity 0.15s ease',
  ':active': {
    opacity: 0.9,
  },
});
