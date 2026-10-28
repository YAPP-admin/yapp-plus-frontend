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

export const toggleTrack = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  width: '52px',
  height: '28px',
  padding: '2px',
  borderRadius: vars.$radius.full,
  border: 'none',
  cursor: 'pointer',
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

export const toggleThumb = style({
  display: 'block',
  width: '24px',
  height: '24px',
  borderRadius: vars.$radius.full,
  background: '#FFFFFF',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
  transition: 'transform 0.2s ease',
  selectors: {
    [`${toggleTrack}[data-checked="true"] &`]: {
      transform: 'translateX(24px)',
    },
    [`${toggleTrack}[data-checked="false"] &`]: {
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
    background: vars.$color.bg.layerFill,
  },
});
