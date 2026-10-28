import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const tabList = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x4,
  width: '100%',
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const tabTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 6px 10px',
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.placeholder,
  cursor: 'pointer',
  touchAction: 'manipulation',
  transition: 'color 150ms ease, border-color 150ms ease',
  margin: 0,
  marginBottom: '-1px',
  ':hover': {
    color: vars.$color.fg.neutral,
  },
  ':focus-visible': {
    outline: `2px solid ${vars.$color.fg.neutral}`,
    outlineOffset: '-2px',
    borderRadius: vars.$radius.r1,
  },
});

export const tabTriggerActive = style({
  color: vars.$color.fg.neutral,
  borderBottomColor: vars.$color.fg.neutral,
});
