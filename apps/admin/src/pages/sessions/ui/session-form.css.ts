/** 작은 화면에서도 본문만 스크롤하고 저장·취소 버튼은 유지합니다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const dialog = style({
  width: 'min(720px, calc(100vw - 32px))',
  maxWidth: 'none',
  height: 'min(880px, calc(100dvh - 32px))',
  maxHeight: 'calc(100dvh - 32px)',
});
export const form = style({ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 });
export const body = style({ overflowY: 'auto', scrollbarGutter: 'stable', flex: 1, minHeight: 0 });
export const fields = style({
  display: 'grid',
  gap: 20,
  border: 0,
  padding: 0,
  margin: 0,
  minWidth: 0,
});
export const choices = style({ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 16 });

export const schedule = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 20,
  '@media': { '(max-width: 600px)': { gridTemplateColumns: '1fr' } },
});
export const name = style({ gridColumn: '1 / -1' });
export const actions = style({ flexDirection: 'row', gap: 8 });

export const feedback = style({ minHeight: 40 });

export const pickerDialog = style({
  width: 'min(400px, calc(100vw - 32px))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 32px)',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
