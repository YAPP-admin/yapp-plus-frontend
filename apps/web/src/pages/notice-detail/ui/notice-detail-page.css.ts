/** 공지 상세의 본문 배치와 첨부 이미지 가로 스크롤 스타일을 정의한다. */
import { vars } from '@seed-design/css/vars';
import { globalStyle, style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerDefault,
  padding: `14px ${vars.$dimension.x5} 60px`,
});

export const headerSection = style({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '28px',
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  marginBottom: '24px',
});

export const metaInfoRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const baseChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3px 6px',
  borderRadius: '4px',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  flexShrink: 0,
});

export const sessionChip = style([
  baseChip,
  {
    background: vars.$color.bg.informativeWeak,
    color: vars.$color.fg.informative,
  },
]);

export const assignmentChip = style([
  baseChip,
  {
    background: vars.$color.bg.positiveWeak,
    color: vars.$color.fg.positive,
  },
]);

export const etcChip = style([
  baseChip,
  {
    background: vars.$color.bg.neutralMuted,
    color: vars.$color.fg.neutralMuted,
  },
]);

export const dDayChip = style([
  baseChip,
  {
    background: vars.$color.bg.warningWeak,
    color: vars.$color.fg.warning,
  },
]);

export const titleText = style({
  fontSize: vars.$fontSize.t7,
  lineHeight: vars.$lineHeight.t7,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
  marginBottom: '10px',
});

export const dateText = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  margin: 0,
});

export const metaBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px 18px',
  borderRadius: '8px',
  background: vars.$color.bg.neutralMuted,
  marginBottom: '28px',
});

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

export const metaLabel = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  width: '64px',
  flexShrink: 0,
});

export const metaValue = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const metaLink = style({
  color: vars.$color.fg.neutralMuted,
  textDecoration: 'underline',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
});

export const contentSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  marginBottom: '8px',
});

export const attachmentSection = style({
  display: 'flex',
  minWidth: 0,
  gap: vars.$dimension.x2,
  marginBottom: '32px',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  ':focus-visible': {
    outline: `2px solid ${vars.$color.fg.neutral}`,
    outlineOffset: '2px',
  },
  // 마지막 이미지도 앞선 이미지와 같은 왼쪽 시작점에 맞춰 멈추게 한다.
  '::after': {
    content: '""',
    flex: `0 0 calc(12% - ${vars.$dimension.x2})`,
  },
});

export const attachmentItem = style({
  margin: 0,
  flex: '0 0 88%',
  minWidth: 0,
  scrollSnapAlign: 'start',
});

export const attachmentImage = style({
  width: '100%',
  background: vars.$color.bg.neutralMuted,
});

// 원본 비율과 관계없이 이미지를 4:5 프레임에 꽉 채운다.
globalStyle(`${attachmentImage} img`, { objectFit: 'cover' });

export const attachmentFallback = style({
  display: 'none',
  selectors: {
    '[data-loading-state="error"] > &': { display: 'grid' },
  },
  placeItems: 'center',
  aspectRatio: '4 / 5',
  background: vars.$color.bg.neutralMuted,
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  color: vars.$color.fg.neutralMuted,
});

export const paragraph = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutral,
  margin: 0,
  whiteSpace: 'pre-line',
});

export const confirmSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '24px 0',
});

export const confirmTextGroup = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
});

export const confirmQuestion = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const confirmCount = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  margin: 0,
});

/** SEED 이미지 상태를 사용해 캐시된 실패에서도 스켈레톤 대신 오류 안내를 표시합니다. */
export const attachmentLoading = style({
  selectors: {
    '[data-loading-state="error"] > &': { display: 'none' },
  },
});
