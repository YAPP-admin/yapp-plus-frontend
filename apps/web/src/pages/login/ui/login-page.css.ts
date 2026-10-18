import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

// 피그마 body 레이아웃: 좌우 패딩 20px, 타이틀 위 14px, 타이틀과 본문 사이 20px
export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x5,
  boxSizing: 'border-box',
  padding: `${vars.$dimension.x3_5} ${vars.$dimension.x5} 0`,
  maxWidth: '480px',
  margin: '0 auto',
  width: '100%',
});

// 피그마 Container: 위 패딩 64px, 그래픽과 로그인 영역 사이 56px
export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x14,
  paddingTop: vars.$dimension.x16,
});

export const illustrationSection = style({
  display: 'flex',
  justifyContent: 'center',
});

// 피그마 로그인 영역: 위아래 패딩 48px, 버튼 사이 간격 10px
export const buttonGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.$dimension.x2_5,
  paddingBlock: vars.$dimension.x12,
});

// SEED ActionButton 규격은 유지하고 폭만 지정합니다.
export const socialButton = style({
  width: '100%',
});
