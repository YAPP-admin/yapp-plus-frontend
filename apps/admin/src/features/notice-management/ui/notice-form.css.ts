/** 입력의 외형과 상태는 SEED에 맡기고 폼 배치만 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const form = style({ display: 'grid', gap: 24, minWidth: 0 });
export const group = style({ border: 0, padding: 0, margin: 0, minWidth: 0 });
export const choices = style({ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12 });
export const pickerDialog = style({
  width: 'min(400px, calc(100vw - 32px))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 32px)',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
export const pickerActions = style({ flexDirection: 'row', gap: 8 });
