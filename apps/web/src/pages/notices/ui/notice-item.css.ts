import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const item = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0',
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  boxSizing: 'border-box',
  width: '100%',
  textDecoration: 'none',
  transition: 'opacity 150ms ease',
  ':active': {
    opacity: 0.7,
  },
});

export const chipRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: vars.$dimension.x2,
});

export const baseChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  flexShrink: 0,
});

export const sessionChip = style([
  baseChip,
  {
    background: vars.$color.bg.informativeWeak,
    color: vars.$color.fg.informative,
  },
]);

export const assignmentChip = style([
  baseChip,
  {
    background: vars.$color.bg.positiveWeak,
    color: vars.$color.fg.positive,
  },
]);

export const etcChip = style([
  baseChip,
  {
    background: vars.$color.bg.neutralMuted,
    color: vars.$color.fg.neutralMuted,
  },
]);

export const dDayChip = style([
  baseChip,
  {
    background: vars.$color.bg.warningWeak,
    color: vars.$color.fg.warning,
  },
]);

export const titleText = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
  marginBottom: '8px',
});

export const dateText = style({
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
});
