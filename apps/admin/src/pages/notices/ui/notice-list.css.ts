/** 조회 결과 개수·카드 목록·조회 안내 상태의 스타일이다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const results = style({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
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
  paddingBlock: vars.$dimension.x8,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t4,
});
