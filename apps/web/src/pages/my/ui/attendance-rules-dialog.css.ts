import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.46)',
  zIndex: 100,
});

export const positioner = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `0 ${vars.$dimension.x5}`,
  zIndex: 101,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '346px',
  background: vars.$color.bg.layerDefault,
  borderRadius: '12px',
  padding: '18px 20px',
  boxSizing: 'border-box',
  gap: vars.$dimension.x4,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
});

export const header = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x3,
});

export const title = style({
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const ruleGroups = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
});

export const ruleGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x1,
});

export const ruleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x3,
  width: '100%',
});

export const ruleRowIndented = style([
  ruleRow,
  {
    paddingLeft: vars.$dimension.x2,
  },
]);

export const ruleLabel = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export const dottedLine = style({
  flex: 1,
  height: '1px',
  borderBottom: '1px dashed #DCDEE3',
  minWidth: '8px',
});

export const ruleScore = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.brand,
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export const noteBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  background: '#F7F8F9',
  borderRadius: vars.$radius.r2,
  padding: '12px 14px',
});

export const noteItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '4px',
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralSubtle,
  margin: 0,
  wordBreak: 'keep-all',
});

export const noteBullet = style({
  flexShrink: 0,
  lineHeight: vars.$lineHeight.t3,
});

export const confirmButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '46px',
  padding: `0 ${vars.$dimension.x5}`,
  background: vars.$color.bg.brandSolid,
  color: '#FFFFFF',
  borderRadius: vars.$radius.r2,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  boxSizing: 'border-box',
  ':active': {
    opacity: 0.9,
  },
});
