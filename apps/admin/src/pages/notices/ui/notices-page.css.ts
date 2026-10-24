/** 공지 목록의 제목·탭형 필터·단일 열 카드와 고정 작성 버튼 스타일이다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  width: 'min(100%, 75rem)',
  gap: 16,
  marginInline: 'auto',
  padding: '48px 44px 110px',
  '@media': { '(width < 768px)': { padding: '32px 16px 100px' } },
});
export const header = style({
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'space-between',
  gap: 16,
});
export const eyebrow = style({
  margin: '0 0 8px',
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.brand,
});
export const title = style({
  margin: 0,
  fontSize: vars.$fontSize.t12,
  lineHeight: vars.$lineHeight.t12,
  fontWeight: vars.$fontWeight.bold,
});
export const description = style({
  margin: '10px 0 0',
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
});
export const total = style({
  flexShrink: 0,
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
});
export const filter = style({
  display: 'flex',
  gap: 24,
  marginTop: 22,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
export const filterItem = style({
  display: 'flex',
  alignItems: 'center',
  minHeight: 44,
  padding: '0 2px',
  border: 0,
  borderBottom: '2px solid transparent',
  background: 'transparent',
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutralMuted,
  cursor: 'pointer',
  selectors: {
    '&[data-checked]': { borderBottomColor: vars.$color.fg.brand, color: vars.$color.fg.neutral },
    '&:focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: 2 },
  },
});
export const results = style({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});
export const list = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: 9,
  padding: 0,
  margin: 0,
  listStyle: 'none',
});
export const placeholder = style({
  margin: 0,
  paddingBlock: 32,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
});
export const createLink = style({
  position: 'fixed',
  right: 24,
  bottom: 24,
  zIndex: 3,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
  minHeight: 50,
  padding: '0 20px',
  borderRadius: 25,
  background: vars.$color.bg.neutralInverted,
  color: vars.$color.fg.neutralInverted,
  boxShadow: '0 12px 30px #0006',
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
  textDecoration: 'none',
  touchAction: 'manipulation',
  selectors: {
    '&:focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: 3 },
  },
});
