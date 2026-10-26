/** 좁은 화면에서도 지도와 읽기 전용 좌표을 함께 사용할 수 있는 배치입니다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const root = style({ display: 'grid', gap: 16, minWidth: 0 });
export const map = style({ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden' });
export const coordinates = style({
  margin: 0,
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  '@media': { '(max-width: 480px)': { gridTemplateColumns: '1fr' } },
});
export const hint = style({ margin: 0, fontSize: 14, color: vars.$color.fg.neutralMuted });
export const actions = style({ display: 'flex', flexWrap: 'wrap', gap: 8 });

export const value = style({ margin: '4px 0 0', fontVariantNumeric: 'tabular-nums' });
