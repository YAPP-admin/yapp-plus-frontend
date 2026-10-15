import { style } from '@vanilla-extract/css';
import { breakpoints } from '@seed-design/css/breakpoints';
import { vars } from '@seed-design/css/vars';

const narrowScreen = `(width < ${breakpoints.lg}px)`;

export const shell = style({
  display: 'flex',
  minHeight: '100dvh',
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
});

export const sidebar = style({
  selectors: {
    '&&': {
      position: 'sticky',
      top: 0,
      height: '100dvh',
      background: vars.$color.bg.layerFloating,
      color: vars.$color.fg.neutral,
      borderRight: `1px solid ${vars.$color.stroke.neutralMuted}`,
      transition: 'none',
      '@media': {
        [narrowScreen]: {
          position: 'static',
          height: 'auto',
          flex: 1,
          minHeight: 0,
          width: '100%',
          borderRight: 'none',
        },
      },
    },
  },
});

export const sidebarHeader = style({
  selectors: {
    '&&': { padding: vars.$dimension.x6, paddingBottom: vars.$dimension.x5 },
  },
});

export const brand = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x3,
  minHeight: '2.75rem',
  color: vars.$color.fg.neutral,
  textDecoration: 'none',
  borderRadius: vars.$radius.r2,
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.stroke.focusRing}`,
      outlineOffset: vars.$dimension.x1,
    },
  },
});

export const brandMark = style({
  display: 'grid',
  placeItems: 'center',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.brandSolid,
  color: vars.$color.fg.neutralInverted,
  fontSize: vars.$fontSize.t6,
  fontWeight: vars.$fontWeight.bold,
});

export const brandText = style({ display: 'grid', gap: vars.$dimension.x0_5 });

export const generation = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: `0 ${vars.$dimension.x4} ${vars.$dimension.x5}`,
  padding: vars.$dimension.x4,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerDefault,
});

export const generationHeading = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const navigation = style({
  selectors: { '&&': { gap: vars.$dimension.x5, paddingInline: vars.$dimension.x3 } },
});

export const groupLabel = style({
  selectors: {
    '&&': {
      padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
      fontSize: vars.$fontSize.t2,
      fontWeight: vars.$fontWeight.medium,
    },
  },
});

export const navigationLink = style({
  textDecoration: 'none',
  touchAction: 'manipulation',
  minHeight: '2.75rem',
});

export const navigationLabel = style({
  selectors: { '&&': { paddingLeft: vars.$dimension.x1 } },
});

export const sidebarFooter = style({
  selectors: {
    '&&': {
      display: 'flex',
      alignItems: 'center',
      gap: vars.$dimension.x3,
      padding: vars.$dimension.x5,
      borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
    },
  },
});

export const profileMark = style({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: '2.25rem',
  height: '2.25rem',
  borderRadius: vars.$radius.full,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  fontWeight: vars.$fontWeight.bold,
});

export const profileText = style({ display: 'grid', gap: vars.$dimension.x1 });

export const workspace = style({ flex: 1, minWidth: 0 });

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x4,
  minHeight: '4.25rem',
  paddingInline: vars.$dimension.x8,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  background: vars.$color.bg.layerDefault,
  '@media': { [narrowScreen]: { paddingInline: vars.$dimension.x4, gap: vars.$dimension.x3 } },
});

export const breadcrumbs = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x3,
  margin: 0,
  padding: 0,
  listStyle: 'none',
  flexWrap: 'wrap',
  '@media': { [narrowScreen]: { columnGap: vars.$dimension.x2, rowGap: 0 } },
});

export const separator = style({ color: vars.$color.fg.neutralSubtle });

export const content = style({
  width: '100%',
  maxWidth: '75rem',
  marginInline: 'auto',
  paddingInline: vars.$dimension.x5,
  overflowX: 'auto',
  '@media': { [narrowScreen]: { paddingInline: 0 } },
});

export const menuButton = style({
  minWidth: '2.75rem',
  minHeight: '2.75rem',
  flexShrink: 0,
  touchAction: 'manipulation',
});
export const environmentBadge = style({ '@media': { '(width < 480px)': { display: 'none' } } });
export const mobilePanel = style({
  selectors: {
    '&&': {
      width: 'min(20rem, calc(100vw - 3rem))',
      maxWidth: '100%',
      height: '100dvh',
      maxHeight: '100dvh',
      borderRadius: 0,
      overflow: 'hidden',
    },
  },
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none', animation: 'none' } },
});
export const panelBackdrop = style({
  '@media': { '(prefers-reduced-motion: reduce)': { transition: 'none', animation: 'none' } },
});
export const srOnly = style({
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

export const closeButton = style({
  selectors: {
    '&&': {
      width: '3.25rem',
      height: '3.25rem',
      padding: '0.875rem',
      color: vars.$color.fg.neutral,
      touchAction: 'manipulation',
    },
  },
});
