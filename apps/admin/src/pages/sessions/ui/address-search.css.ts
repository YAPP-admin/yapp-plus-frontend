/** SEED 입력·버튼과 주소 결과 목록의 배치, 긴 주소 줄바꿈을 정의합니다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const root = style({ display: 'grid', gap: 12, minWidth: 0 });
export const searchRow = style({ display: 'flex', alignItems: 'flex-end', gap: 8 });
export const field = style({ flex: 1, minWidth: 0 });
export const hint = style({ margin: 0, fontSize: 14, color: vars.$color.fg.neutralMuted });
export const selection = style({
  display: 'grid',
  gap: 4,
  padding: 16,
  borderRadius: 12,
  background: vars.$color.bg.neutralWeak,
  overflowWrap: 'anywhere',
});
// 안내 두 줄과 재시도 버튼을 한 행에 배치해 과도한 여백 없이 높이를 유지합니다.
export const status = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 40,
});
export const statusMessage = style({
  margin: 0,
  flex: 1,
  minWidth: 0,
  fontSize: 14,
  lineHeight: '20px',
  color: vars.$color.fg.neutralMuted,
  overflowWrap: 'anywhere',
});
export const results = style({
  display: 'grid',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: 12,
  overflow: 'hidden',
});
export const result = style({
  display: 'flex',
  width: '100%',
  minHeight: 48,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: 16,
  border: 0,
  textAlign: 'left',
  font: 'inherit',
  color: vars.$color.fg.neutral,
  background: vars.$color.bg.layerDefault,
  cursor: 'pointer',
  overflowWrap: 'anywhere',
  selectors: {
    '&:hover, &[aria-pressed="true"]': { background: vars.$color.bg.neutralWeak },
    '&:focus-visible': { outline: `2px solid ${vars.$color.fg.neutral}`, outlineOffset: -3 },
    '&:disabled': { cursor: 'default', opacity: 0.5 },
  },
});
export const badge = style({ flexShrink: 0, fontSize: 14, color: vars.$color.fg.neutralMuted });
export const pages = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 16,
});
