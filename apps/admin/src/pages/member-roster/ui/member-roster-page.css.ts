/** 관리자 토큰을 사용하고 좁은 화면에서도 네 열과 머리글의 관계를 유지합니다. */
import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  width: 'min(100%, 72rem)',
  gap: vars.$dimension.x4,
  marginInline: 'auto',
  padding: `${vars.$dimension.x12} ${vars.$dimension.x6}`,
  '@media': { '(max-width: 480px)': { paddingInline: vars.$dimension.x3 } },
});
export const notice = style({
  margin: 0,
  padding: vars.$dimension.x4,
  borderRadius: vars.$dimension.x2,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutralMuted,
});
export const toolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  flexWrap: 'wrap',
});
export const table = style({
  width: '100%',
  tableLayout: 'fixed',
  borderCollapse: 'separate',
  borderSpacing: 0,
  overflowWrap: 'anywhere',
  textAlign: 'left',
});
globalStyle(`${table} th, ${table} td`, {
  padding: `${vars.$dimension.x4} ${vars.$dimension.x2}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
globalStyle(`${table} thead th`, {
  position: 'sticky',
  top: 0,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutralMuted,
  zIndex: 1,
});
globalStyle(`${table} caption`, {
  textAlign: 'left',
  paddingBottom: vars.$dimension.x3,
  fontWeight: vars.$fontWeight.bold,
});
