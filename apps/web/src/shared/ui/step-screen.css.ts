import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

// 가입 흐름 화면의 공통 배치(피그마 Sign-up_*): 본문은 남은 높이를 채우고 하단 CTA는 화면 아래에 둡니다.
export const screen = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
});

// 피그마 contents: 좌우 패딩 20px, 위 패딩 20px
export const body = style({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: `${vars.$dimension.x5} ${vars.$dimension.x5} 0`,
});

// 피그마 title: 제목과 설명 사이 10px
export const heading = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x2_5,
});

// 피그마 btn-cta: 좌우 패딩 16px, 위아래 패딩 12px
export const footer = style({
  display: 'flex',
  flexDirection: 'column',
  padding: `${vars.$dimension.x3} ${vars.$dimension.x4}`,
});
