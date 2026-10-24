/** 본문 서식 도구와 링크 입력 영역의 스타일을 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const toolbar = style({
  border: 0,
  margin: 0,
  minWidth: 0,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 3,
  padding: '5px 8px',
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  background: vars.$color.bg.layerFloating,
});

export const control = style({
  minHeight: 44,
  minWidth: 44,
  padding: `${vars.$dimension.x2} ${vars.$dimension.x3}`,
  border: '1px solid transparent',
  borderRadius: 6,
  background: 'transparent',
  color: vars.$color.fg.neutral,
  fontSize: 16,
  cursor: 'pointer',
  selectors: {
    '&:hover': { background: vars.$color.bg.layerFloating },
    '&[aria-pressed="true"]': { background: '#e7ebff', color: '#3549a4' },
    '&:focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: -2 },
    '&:disabled': { opacity: 0.35, cursor: 'default' },
  },
});

export const linkRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.$dimension.x2,
  padding: vars.$dimension.x3,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const toolButton = style([
  control,
  {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    minWidth: 27,
    minHeight: 27,
    borderRadius: 5,
    fontSize: 11,
    color: vars.$color.fg.neutralMuted,
    '@media': { '(pointer: coarse)': { minWidth: 44, minHeight: 44 } },
  },
]);
export const separator = style({
  width: 1,
  height: 16,
  marginInline: 5,
  alignSelf: 'center',
  background: vars.$color.stroke.neutralMuted,
});
