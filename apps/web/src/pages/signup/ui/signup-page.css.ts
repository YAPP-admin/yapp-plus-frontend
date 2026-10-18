import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

// 피그마 Sign-up_1: 본문과 하단 CTA를 세로로 배치하고 CTA를 화면 아래에 둡니다.
export const page = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
});

// 피그마 contents: 좌우 패딩 20px, 위 패딩 20px, 제목과 입력창 사이 40px
export const contents = style({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  gap: vars.$dimension.x10,
  padding: `${vars.$dimension.x5} ${vars.$dimension.x5} 0`,
});

// 피그마 btn-cta: 좌우 패딩 16px, 위아래 패딩 12px
export const bottom = style({
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
});

export const submitButton = style({
  width: '100%',
});
