/** 읽음 표는 좁은 화면에서 독립적으로 가로 스크롤한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const scroll = style({
  minWidth: 0,
  overflowX: 'auto',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
  ':focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: 2 },
});

export const table = style({
  width: '100%',
  minWidth: 720,
  borderCollapse: 'separate',
  borderSpacing: 0,
  textAlign: 'left',
});

export const caption = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
});

export const cell = style({
  height: 56,
  padding: `0 ${vars.$dimension.x4}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  whiteSpace: 'nowrap',
  selectors: {
    'thead &': {
      height: 48,
      background: vars.$color.bg.neutralWeak,
      color: vars.$color.fg.neutralMuted,
      fontSize: vars.$fontSize.t1,
      fontWeight: vars.$fontWeight.medium,
    },
    'tbody tr:last-child &': { borderBottom: 0 },
  },
});

export const memberCell = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.$dimension.x2,
});

export const avatar = style({
  display: 'inline-grid',
  width: 28,
  height: 28,
  placeItems: 'center',
  borderRadius: vars.$radius.full,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
});

export const memberMeta = style({ color: vars.$color.fg.neutralMuted });

const readStatusBase = style({
  display: 'inline-grid',
  width: 24,
  height: 24,
  placeItems: 'center',
  borderRadius: vars.$radius.full,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
});

export const readStatus = style([
  readStatusBase,
  { background: vars.$color.bg.positiveWeak, color: vars.$color.fg.positive },
]);

export const unreadStatus = style([
  readStatusBase,
  { background: vars.$color.bg.criticalWeak, color: vars.$color.fg.critical },
]);
