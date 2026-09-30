import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  minHeight: '100dvh',
  gridTemplateRows: 'auto 1fr',
  paddingTop: 'var(--safe-area-inset-top, env(safe-area-inset-top, 0px))',
  paddingRight: 'var(--safe-area-inset-right, env(safe-area-inset-right, 0px))',
  paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
  paddingLeft: 'var(--safe-area-inset-left, env(safe-area-inset-left, 0px))',
});

export const header = style({
  display: 'flex',
  minHeight: '3.5rem',
  alignItems: 'center',
  paddingInline: vars.$dimension.x6,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const wordmark = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: 0,
});

export const content = style({
  display: 'grid',
  width: 'min(100%, 68rem)',
  alignContent: 'center',
  justifySelf: 'center',
  padding: `${vars.$dimension.x8} ${vars.$dimension.x6}`,
});

export const intro = style({
  display: 'grid',
  maxWidth: '40rem',
  gap: vars.$dimension.x4,
});

export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t9,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: 0,
  lineHeight: vars.$lineHeight.t9,
  textWrap: 'balance',
  '@media': {
    'screen and (min-width: 48rem)': {
      fontSize: vars.$fontSize.t10,
      lineHeight: vars.$lineHeight.t10,
    },
  },
});

export const description = style({
  maxWidth: '34ch',
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t5,
  fontWeight: vars.$fontWeight.regular,
  lineHeight: vars.$lineHeight.t5,
  textWrap: 'pretty',
});

export const accent = style({
  width: '3rem',
  height: '0.25rem',
  marginTop: vars.$dimension.x2,
  background: vars.$color.bg.brandSolid,
});
