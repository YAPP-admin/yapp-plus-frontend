import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const links = style({
  display: 'grid',
  gap: vars.$dimension.x2,
});

export const link = style({
  display: 'flex',
  alignItems: 'center',
  minHeight: '3rem',
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  textDecoration: 'underline',
  textUnderlineOffset: '0.2em',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.neutral}`,
      outlineOffset: '2px',
    },
  },
});
