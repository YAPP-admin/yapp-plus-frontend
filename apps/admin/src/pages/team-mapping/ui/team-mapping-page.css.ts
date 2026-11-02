/** 팀 매핑 팀 빌딩 전 화면의 반응형 레이아웃을 정의한다. */
import { style } from '@vanilla-extract/css';
import { breakpoints } from '@seed-design/css/breakpoints';
import { vars } from '@seed-design/css/vars';

const narrowScreen = `(width < ${breakpoints.lg}px)`;

export const page = style({
  display: 'grid',
  width: 'min(100%, 72rem)',
  gap: vars.$dimension.x8,
  marginInline: 'auto',
  padding: `${vars.$dimension.x10} ${vars.$dimension.x6}`,
  '@media': { [narrowScreen]: { padding: `${vars.$dimension.x8} ${vars.$dimension.x4}` } },
});

export const previewField = style({
  width: 'min(100%, 16rem)',
  justifySelf: 'end',
  '@media': { [narrowScreen]: { width: '100%', justifySelf: 'stretch' } },
});

export const emptyState = style({
  display: 'grid',
  justifyItems: 'center',
  gap: vars.$dimension.x3,
  minHeight: '22rem',
  padding: `${vars.$dimension.x12} ${vars.$dimension.x6}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r4,
  background: vars.$color.bg.layerDefault,
  textAlign: 'center',
});

export const emptyIcon = style({
  display: 'grid',
  placeItems: 'center',
  width: '3.5rem',
  height: '3.5rem',
  borderRadius: vars.$radius.full,
  background: vars.$color.bg.brandWeak,
  color: vars.$color.fg.brand,
});

export const emptyTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t6,
  lineHeight: vars.$lineHeight.t6,
  fontWeight: vars.$fontWeight.bold,
});

export const emptyDescription = style({
  maxWidth: '42ch',
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  textWrap: 'pretty',
});

export const actions = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: vars.$dimension.x2,
  marginTop: vars.$dimension.x3,
});

export const footerAction = style({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: vars.$dimension.x2,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
