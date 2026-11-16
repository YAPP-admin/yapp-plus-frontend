import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  minHeight: '100%',
  backgroundColor: vars.$color.bg.layerDefault,
});

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  height: '54px',
  padding: `0 ${vars.$dimension.x4}`,
  backgroundColor: vars.$color.bg.layerDefault,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const headerTitle = style({
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const headerSpacer = style({
  width: vars.$dimension.x6,
  height: vars.$dimension.x6,
});

export const body = style({
  flex: 1,
  padding: 0,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const list = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  width: '100%',
});

export const listItem = style({
  paddingBlock: vars.$dimension.x5,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const itemMessage = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutral,
  flexShrink: 1,
  whiteSpace: 'pre-line',
  margin: 0,
});

export const itemDate = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.regular,
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
});

export const emptyContainer = style({
  flex: 1,
  padding: `0 ${vars.$dimension.x4} ${vars.$dimension.x8}`,
});

export const emptyGraphic = style({
  width: '90px',
  height: '74px',
  userSelect: 'none',
});

export const emptyText = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.regular,
  color: vars.$color.fg.neutralSubtle,
  textAlign: 'center',
  margin: 0,
});
