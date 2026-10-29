/** 종류 필터의 배치와 선택·키보드 포커스 상태를 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const filter = style({
  display: 'flex',
  gap: vars.$dimension.x6,
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
    '&[data-focus-visible]': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: 2 },
  },
});
