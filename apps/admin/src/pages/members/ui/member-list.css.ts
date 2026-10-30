import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const scroll = style({
  overflowX: 'auto',
  selectors: {
    '&:focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: 2 },
  },
});
export const table = style({
  width: '100%',
  minWidth: '46rem',
  tableLayout: 'fixed',
  borderCollapse: 'separate',
  borderSpacing: '0 8px',
  textAlign: 'left',
  fontSize: vars.$fontSize.t2,
});
export const role = style({ width: '7rem' });
export const score = style({ width: '7rem' });
export const team = style({ width: '10rem' });
export const date = style({ width: '7rem' });
export const more = style({ width: '4rem' });
export const name = style({ overflowWrap: 'anywhere' });
export const caption = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
});
globalStyle(`${table} thead th`, {
  padding: '8px 12px',
  color: vars.$color.fg.neutralMuted,
  fontWeight: vars.$fontWeight.regular,
});
globalStyle(`${table} tbody th, ${table} tbody td`, {
  height: 64,
  padding: '12px',
  background: vars.$color.bg.layerFloating,
  borderBlock: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralSubtle,
});
globalStyle(`${table} tr > :first-child`, { paddingLeft: 24 });
globalStyle(`${table} tbody th`, {
  borderLeft: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12,
});
globalStyle(`${table} tbody td:last-child`, {
  borderRight: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderTopRightRadius: 12,
  borderBottomRightRadius: 12,
  paddingInline: 4,
});
