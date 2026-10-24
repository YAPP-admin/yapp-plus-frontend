/** 공지 페이지의 외곽 배치와 고정 작성 버튼 위치를 정의한다. */
import { style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  width: 'min(100%, 75rem)',
  gap: vars.$dimension.x4,
  marginInline: 'auto',
  padding: '48px 44px 110px',
  '@media': { '(width < 768px)': { padding: '32px 16px 100px' } },
});

export const createLink = style({
  position: 'fixed',
  right: vars.$dimension.x6,
  bottom: vars.$dimension.x6,
  zIndex: 3,
  gap: 9,
  minHeight: 50,
  padding: `0 ${vars.$dimension.x5}`,
  borderRadius: 25,
  boxShadow: '0 12px 30px #0006',
  fontSize: vars.$fontSize.t2,
});
