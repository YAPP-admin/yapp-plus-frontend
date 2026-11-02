/** 팀 카드의 원본 정보·경고·팀원 목록 레이아웃을 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const card = style({
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(13rem, 18rem) minmax(0, 1fr) auto auto',
  alignItems: 'center',
  gap: vars.$dimension.x5,
  padding: `${vars.$dimension.x5} ${vars.$dimension.x6}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r4,
  background: vars.$color.bg.layerFloating,
  color: vars.$color.fg.neutral,
  overflowWrap: 'anywhere',
  '@media': {
    '(width < 960px)': {
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      gap: vars.$dimension.x4,
    },
    '(width < 480px)': { padding: vars.$dimension.x4 },
  },
});

export const identity = style({
  minWidth: 0,
  display: 'grid',
  alignContent: 'center',
  gap: vars.$dimension.x1,
});

export const teamNameRow = style({
  display: 'flex',
  alignItems: 'baseline',
  minWidth: 0,
  gap: vars.$dimension.x2,
});

export const eyebrow = style({
  color: vars.$color.fg.brand,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: '0.08em',
});

export const title = style({
  minWidth: 0,
  margin: 0,
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
});

export const titleButton = style({
  margin: 0,
  padding: 0,
  border: 0,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  textDecoration: 'underline',
  textDecorationColor: vars.$color.stroke.neutralMuted,
  textUnderlineOffset: '0.2em',
  cursor: 'pointer',
  ':hover': { textDecorationColor: vars.$color.fg.brand },
  ':focus-visible': { outline: `2px solid ${vars.$color.stroke.focusRing}`, outlineOffset: '3px' },
});

export const serviceName = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
});

export const memberCount = style({
  flexShrink: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
});

export const menuButton = style({ minWidth: 44, minHeight: 44, flexShrink: 0 });

export const content = style({
  minWidth: 0,
  display: 'grid',
  gap: vars.$dimension.x3,
  '@media': {
    '(width < 960px)': { gridColumn: '1 / -1' },
  },
});

export const statusRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
  minWidth: 0,
  '@media': {
    '(width < 960px)': { justifyContent: 'flex-start' },
  },
});

export const warning = style({
  maxWidth: '14rem',
  color: vars.$color.fg.critical,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  textAlign: 'right',
  '@media': {
    '(width < 960px)': { maxWidth: 'none', textAlign: 'left' },
  },
});

export const parts = style({ display: 'flex', flexWrap: 'wrap', gap: vars.$dimension.x1_5 });

export const members = style({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: vars.$dimension.x3,
  rowGap: vars.$dimension.x1,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const member = style({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: vars.$dimension.x1,
  whiteSpace: 'nowrap',
});

export const memberSeparator = style({
  color: vars.$color.fg.neutralMuted,
});

export const memberPart = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
});
