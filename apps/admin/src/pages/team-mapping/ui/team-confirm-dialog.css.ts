/** 팀 확정 요약 모달의 읽기 전용 정보 배치를 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const dialog = style({
  width: 'min(32rem, 100vw)',
  maxWidth: '100%',
});

export const summary = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const summaryItem = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
});

export const summaryLabel = style({
  color: vars.$color.fg.neutralMuted,
});

export const summaryValue = style({
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
});

export const warning = style({
  margin: 0,
  padding: vars.$dimension.x3,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.criticalWeak,
  color: vars.$color.fg.critical,
});
