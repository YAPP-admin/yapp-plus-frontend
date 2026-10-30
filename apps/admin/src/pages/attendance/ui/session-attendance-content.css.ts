import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const card = style({
  padding: vars.$dimension.x5,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.neutralWeak,
});
export const heading = style({
  margin: 0,
  fontSize: vars.$fontSize.t5,
  fontWeight: vars.$fontWeight.bold,
});
export const secondary = style({
  display: 'block',
  marginTop: vars.$dimension.x1,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
});
export const inlineControl = style({ display: 'inline-flex', alignItems: 'center' });
export const badgeButton = style({
  minHeight: '2rem',
  paddingInline: vars.$dimension.x2,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: 'transparent',
  color: vars.$color.fg.neutral,
  font: 'inherit',
  cursor: 'pointer',
});
export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});
export const summary = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: vars.$dimension.x2,
  marginBottom: 0,
});
export const stat = style({
  padding: vars.$dimension.x3,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
});
export const scroll = style({ overflowX: 'auto', outlineOffset: '2px' });
export const tabs = style({
  display: 'flex',
  gap: vars.$dimension.x2,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
export const tab = style({
  padding: vars.$dimension.x3,
  border: 0,
  borderBottom: '2px solid transparent',
  background: 'transparent',
  color: vars.$color.fg.neutralMuted,
  font: 'inherit',
  cursor: 'pointer',
});
export const activeTab = style({
  padding: vars.$dimension.x3,
  border: 0,
  borderBottom: `2px solid ${vars.$color.fg.brand}`,
  background: 'transparent',
  color: vars.$color.fg.neutral,
  font: 'inherit',
  fontWeight: vars.$fontWeight.bold,
  cursor: 'pointer',
});
export const caption = style({
  textAlign: 'left',
  fontWeight: vars.$fontWeight.bold,
  paddingBlock: vars.$dimension.x4,
});
export const table = style({
  width: '100%',
  minWidth: '42rem',
  borderCollapse: 'separate',
  borderSpacing: '0 0.5rem',
  textAlign: 'left',
  fontSize: vars.$fontSize.t3,
});

globalStyle(`${table} th, ${table} td`, { padding: vars.$dimension.x4 });
globalStyle(`${table} tbody tr`, { background: vars.$color.bg.neutralWeak });
globalStyle(`${table} tbody th`, { borderRadius: '0.75rem 0 0 0.75rem' });
globalStyle(`${table} tbody td:last-child`, { borderRadius: '0 0.75rem 0.75rem 0' });
globalStyle(`${stat} dd`, { margin: '0.5rem 0 0', fontWeight: vars.$fontWeight.bold });
