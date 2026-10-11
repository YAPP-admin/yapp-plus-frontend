import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const content = style({
  display: 'grid',
  width: 'min(100%, 68rem)',
  alignContent: 'start',
  justifySelf: 'center',
  gap: vars.$dimension.x4,
  padding: `${vars.$dimension.x8} ${vars.$dimension.x6}`,
});

export const title = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t6,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t6,
  textWrap: 'balance',
});

export const description = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  textWrap: 'pretty',
});
