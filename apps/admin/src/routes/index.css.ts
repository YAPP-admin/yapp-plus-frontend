import { style } from '@vanilla-extract/css';
import { vars } from '@yapp-plus/ui/theme';

export const page = style({
  display: 'grid',
  width: 'min(100%, 72rem)',
  gap: vars.space[12],
  marginInline: 'auto',
  padding: `${vars.space[12]} ${vars.space[6]}`,
});

export const headingGroup = style({
  display: 'grid',
  gap: vars.space[2],
});

export const title = style({
  margin: 0,
  fontSize: '2rem',
  fontWeight: 720,
  letterSpacing: 0,
  lineHeight: 1.2,
});

export const description = style({
  margin: 0,
  color: vars.color.muted,
  fontSize: '0.9375rem',
  lineHeight: 1.6,
});

export const emptyState = style({
  display: 'grid',
  minHeight: '12rem',
  alignContent: 'center',
  gap: vars.space[2],
  paddingBlock: vars.space[8],
  borderTop: `1px solid ${vars.color.line}`,
  borderBottom: `1px solid ${vars.color.line}`,
});

export const emptyTitle = style({
  margin: 0,
  fontSize: '1rem',
  fontWeight: 650,
  letterSpacing: 0,
});

export const emptyDescription = style({
  maxWidth: '52ch',
  margin: 0,
  color: vars.color.muted,
  fontSize: '0.875rem',
  lineHeight: 1.6,
  textWrap: 'pretty',
});
