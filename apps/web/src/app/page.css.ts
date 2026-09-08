import { style } from '@vanilla-extract/css';
import { vars } from '@yapp-plus/ui/theme';

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
  paddingInline: vars.space[6],
  borderBottom: `1px solid ${vars.color.line}`,
});

export const wordmark = style({
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: 0,
});

export const content = style({
  display: 'grid',
  width: 'min(100%, 68rem)',
  alignContent: 'center',
  justifySelf: 'center',
  padding: `${vars.space[8]} ${vars.space[6]}`,
});

export const intro = style({
  display: 'grid',
  maxWidth: '40rem',
  gap: vars.space[4],
});

export const title = style({
  margin: 0,
  fontSize: '3.5rem',
  fontWeight: 760,
  letterSpacing: 0,
  lineHeight: 0.96,
  textWrap: 'balance',
  '@media': {
    'screen and (min-width: 48rem)': {
      fontSize: '5rem',
    },
  },
});

export const description = style({
  maxWidth: '34ch',
  margin: 0,
  color: vars.color.muted,
  fontSize: '1.0625rem',
  lineHeight: 1.65,
  textWrap: 'pretty',
});

export const accent = style({
  width: '3rem',
  height: '0.25rem',
  marginTop: vars.space[2],
  background: vars.color.accent,
});
