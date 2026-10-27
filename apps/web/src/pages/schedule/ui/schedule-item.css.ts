import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const item = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '20px 0',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  boxSizing: 'border-box',
  width: '100%',
});

export const itemPast = style({
  opacity: 0.5,
});

export const itemLeft = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  flex: 1,
  minWidth: 0,
});

export const dateText = style({
  width: '70px',
  flexShrink: 0,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const detailGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x2,
  flex: 1,
  minWidth: 0,
});

export const titleText = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const metaContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const metaIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.$color.fg.placeholder,
  width: '12px',
  height: '12px',
  flexShrink: 0,
});

export const metaText = style({
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
});

export const chip = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 6px',
  borderRadius: vars.$radius.r1,
  background: '#FFF7DE',
  color: '#C49725',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  flexShrink: 0,
});
