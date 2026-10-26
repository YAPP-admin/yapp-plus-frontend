/** 읽음 표는 좁은 화면에서 독립적으로 가로 스크롤한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const scroll = style({
  minWidth: 0,
  overflowX: 'auto',
  ':focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: 2 },
});

export const table = style({
  width: '100%',
  minWidth: 680,
  borderCollapse: 'collapse',
  textAlign: 'left',
});

export const caption = style({
  textAlign: 'left',
  paddingBlock: vars.$dimension.x3,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
});

export const cell = style({
  padding: vars.$dimension.x3,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  whiteSpace: 'nowrap',
});
