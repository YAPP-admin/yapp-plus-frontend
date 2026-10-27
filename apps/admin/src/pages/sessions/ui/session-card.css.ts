import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const card = style({
  minWidth: 0,
  height: '100%',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r4,
  background: vars.$color.bg.layerFloating,

  display: 'flex',
  flexDirection: 'column',
  padding: vars.$dimension.x6,
  color: vars.$color.fg.neutral,
  overflowWrap: 'anywhere',
  '@media': {
    '(width < 480px)': { padding: vars.$dimension.x4 },
  },
});

export const heading = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
});
export const name = style({
  margin: `${vars.$dimension.x4} 0`,
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
});
export const details = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: `0 0 ${vars.$dimension.x6}`,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
});
export const detail = style({
  display: 'grid',
  gridTemplateColumns: '2.5rem minmax(0, 1fr)',
  gap: vars.$dimension.x2,
});
export const attendance = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: vars.$dimension.x2,
  margin: 'auto 0 0',
  paddingTop: vars.$dimension.x4,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  '@media': {
    '(width < 480px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      rowGap: vars.$dimension.x4,
    },
  },
});
export const stat = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  fontSize: vars.$fontSize.t3,
  color: vars.$color.fg.neutralMuted,
});
export const unit = style({
  marginLeft: vars.$dimension.x0_5,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.regular,
  color: vars.$color.fg.neutralMuted,
});

export const term = style({ color: vars.$color.fg.neutralMuted });
export const value = style({ margin: 0, minWidth: 0 });
export const count = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t6,
  fontWeight: vars.$fontWeight.bold,
});

export const menuButton = style({
  minWidth: 44,
  minHeight: 44,
});
