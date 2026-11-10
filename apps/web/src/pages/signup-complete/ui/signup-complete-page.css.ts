import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

// 제목과 일러스트는 본문의 남는 높이를 나눠 작은 화면에서 고정 간격으로 CTA를 밀어내지 않습니다.
export const contents = style({
  justifyContent: 'space-between',
  gap: vars.$dimension.x8,
});

export const illustration = style({
  width: '100%',
  maxWidth: '350px',
  height: 'auto',
  alignSelf: 'center',
});
