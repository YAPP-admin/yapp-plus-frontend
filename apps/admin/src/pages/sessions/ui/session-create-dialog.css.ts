/** 세션 생성 모달의 화면 내 스크롤과 입력·작업 버튼 배치를 정의합니다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const content = style({
  position: 'relative',
  selectors: { '&&': { width: 'min(42.5rem, calc(100vw - 2rem))', maxWidth: '42.5rem' } },
  maxHeight: 'calc(100dvh - 2rem)',
  overflowY: 'auto',
});
export const close = style({
  position: 'absolute',
  top: vars.$dimension.x3,
  right: vars.$dimension.x3,
  minWidth: 44,
  minHeight: 44,
});
export const form = style({ display: 'grid', gap: vars.$dimension.x6 });
export const fields = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.$dimension.x5,
  paddingInline: vars.$dimension.x6,
  '@media': { '(width < 480px)': { gridTemplateColumns: 'minmax(0, 1fr)' } },
});
export const fullWidth = style({ gridColumn: '1 / -1', minWidth: 0 });
export const input = style({ fontSize: vars.$fontSize.t5, minWidth: 0 });
export const actions = style({
  selectors: { '&&': { flexDirection: 'row' } },
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
});

export const header = style({
  selectors: { '&&': { paddingRight: vars.$dimension.x16, paddingBottom: vars.$dimension.x6 } },
});

export const error = style({
  margin: 0,
  paddingInline: vars.$dimension.x6,
  color: vars.$color.fg.critical,
});
