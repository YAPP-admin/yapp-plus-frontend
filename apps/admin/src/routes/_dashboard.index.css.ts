import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  width: 'min(100%, 72rem)',
  gap: vars.$dimension.x12,
  marginInline: 'auto',
  padding: `${vars.$dimension.x12} ${vars.$dimension.x6}`,
});

export const headingGroup = style({
  display: 'grid',
  gap: vars.$dimension.x2,
});

export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t8,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: 0,
  lineHeight: vars.$lineHeight.t8,
});

export const description = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.regular,
  lineHeight: vars.$lineHeight.t4,
});

export const emptyState = style({
  display: 'grid',
  minHeight: '12rem',
  alignContent: 'center',
  gap: vars.$dimension.x2,
  paddingBlock: vars.$dimension.x8,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const emptyTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: 0,
});

export const emptyDescription = style({
  maxWidth: '52ch',
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.regular,
  textWrap: 'pretty',
});
