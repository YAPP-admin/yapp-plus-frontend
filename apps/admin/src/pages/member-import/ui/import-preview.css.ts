import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const preview = style({
  display: 'grid',
  gap: vars.$dimension.x3,
});

export const status = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  margin: 0,
  padding: vars.$dimension.x3,
  borderRadius: vars.$dimension.x2,
  background: vars.$color.bg.neutralWeak,
});

export const notice = style({
  margin: 0,
  padding: vars.$dimension.x3,
  borderRadius: vars.$dimension.x2,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.brand,
});

export const summary = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x3,
  margin: 0,
  color: vars.$color.fg.neutralMuted,
});

export const planned = style({
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
});

export const tableViewport = style({
  maxHeight: 'calc(9 * 4rem)',
  overflow: 'auto',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$dimension.x2,
});

export const table = style({
  width: '100%',
  minWidth: '60rem',
  borderCollapse: 'collapse',
  background: vars.$color.bg.layerFloating,
});

export const caption = style({
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const cell = style({
  padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  textAlign: 'left',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
});

export const headerCell = style({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutralMuted,
  fontWeight: vars.$fontWeight.bold,
});

export const rowHeader = style({
  color: vars.$color.fg.neutralMuted,
  fontWeight: vars.$fontWeight.bold,
});

export const error = style({
  color: vars.$color.fg.critical,
  whiteSpace: 'normal',
});

export const duplicateActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
});

export const duplicateAction = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.$dimension.x1,
  whiteSpace: 'nowrap',
});

export const footer = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
});
