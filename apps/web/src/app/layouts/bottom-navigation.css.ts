/** SEED 탭 동작을 합성해도 기존 하단 메뉴의 배치와 터치 영역을 유지합니다. */
import { vars } from '@seed-design/css/vars';
import { globalStyle, style } from '@vanilla-extract/css';

export const bottomBar = style({
  position: 'sticky',
  bottom: 0,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  background: vars.$color.bg.layerDefault,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderTopLeftRadius: vars.$radius.r1,
  borderTopRightRadius: vars.$radius.r1,
  boxSizing: 'border-box',
  zIndex: 100,
});

export const navigation = style({
  display: 'grid',
  padding: '8px 20px 4px',
  width: '100%',
  boxSizing: 'border-box',
  selectors: {
    '&&': {
      display: 'grid',
      padding: '8px 20px 4px',
      alignItems: 'center',
      boxShadow: 'none',
      overflow: 'visible',
    },
  },
});

export const item = style({
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 0',
  color: vars.$color.fg.neutralSubtle,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  textDecoration: 'none',
  touchAction: 'manipulation',
  transition: 'color 150ms ease, transform 100ms ease',
  selectors: {
    '&&': {
      padding: '4px 0',
      alignItems: 'center',
      fontSize: vars.$fontSize.t2,
      lineHeight: vars.$lineHeight.t2,
      color: vars.$color.fg.neutralSubtle,
      scale: 'none',
      transition: 'color 150ms ease, transform 100ms ease',
    },
    '&&[aria-current="page"]': {
      color: vars.$color.fg.neutralMuted,
      fontWeight: vars.$fontWeight.bold,
    },
    '&:active': {
      transform: 'scale(0.96)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.neutralMuted}`,
      outlineOffset: '-2px',
      borderRadius: vars.$radius.r2,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: { '&&': { transition: 'none' }, '&&:active': { transform: 'none' } },
    },
  },
});

export const itemLabel = style({
  letterSpacing: '-0.2px',
});

export const homeIndicatorArea = style({
  height: '34px',
  paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
  boxSizing: 'content-box',
});

globalStyle('.seed-snackbar-region', {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 'calc(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 108px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  pointerEvents: 'none',
  zIndex: 1000,
});
