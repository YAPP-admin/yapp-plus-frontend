import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const form = style({
  display: 'grid',
  gap: vars.$dimension.x6,
  width: 'min(100%, 36rem)',
});

export const fields = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.$dimension.x4,
  border: 0,
  padding: 0,
  margin: 0,
});

export const spanTwo = style({ gridColumn: '1 / -1' });

export const feedback = style({ minHeight: vars.$dimension.x4 });

export const section = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  paddingBlockStart: vars.$dimension.x5,
  borderBlockStart: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const historyHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: vars.$dimension.x10,
  color: vars.$color.fg.neutralMuted,
});

export const history = style({ display: 'grid', gap: vars.$dimension.x3, margin: 0 });

export const historyItem = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
  borderRadius: vars.$radius.r3,
  backgroundColor: vars.$color.bg.neutralWeak,
});

export const historyMeta = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
});

export const historyChange = style({ color: vars.$color.fg.neutralMuted });

export const historyAfter = style({ color: vars.$color.fg.brand });

export const actions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x2,
  paddingBlockStart: vars.$dimension.x4,
  borderBlockStart: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const actionGroup = style({ display: 'flex', flexWrap: 'wrap', gap: vars.$dimension.x2 });

export const inactiveAction = style({ color: vars.$color.fg.critical });

export const notice = style({ color: vars.$color.fg.neutralMuted });
