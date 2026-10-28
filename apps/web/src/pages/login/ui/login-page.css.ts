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

export const dialogBackdrop = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.46)',
  zIndex: 100,
});

export const dialogPositioner = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `0 ${vars.$dimension.x5}`,
  zIndex: 101,
});

export const dialogContent = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '290px',
  minWidth: '290px',
  maxWidth: '290px',
  background: vars.$color.bg.layerDefault,
  borderRadius: '16px',
  padding: '16px 20px',
  margin: '0 auto',
  boxSizing: 'border-box',
  gap: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)',
});

export const dialogHeader = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  gap: '4px',
  width: '100%',
  padding: '0 !important',
});

export const dialogTitle = style({
  margin: 0,
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  textAlign: 'left',
  width: '100%',
});

export const dialogDescription = style({
  margin: 0,
  fontSize: '14px',
  lineHeight: '19px',
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  textAlign: 'left',
  width: '100%',
  whiteSpace: 'pre-line',
});

export const dialogFooter = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '0 !important',
  boxSizing: 'border-box',
});

export const dialogCancelButton = style({
  flex: '1 1 0',
  width: '100%',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#F3F4F5',
  borderRadius: '8px',
  border: 'none',
  fontSize: '14px',
  lineHeight: '19px',
  fontWeight: vars.$fontWeight.bold,
  color: '#868B94',
  cursor: 'pointer',
  padding: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  textDecoration: 'none',
  transition: 'background-color 0.15s ease',
  ':active': {
    background: '#E5E7EB',
  },
});

export const dialogConfirmButton = style({
  flex: '1 1 0',
  width: '100%',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: vars.$color.bg.brandSolid,
  borderRadius: '8px',
  border: 'none',
  fontSize: '14px',
  lineHeight: '19px',
  fontWeight: vars.$fontWeight.bold,
  color: '#FFFFFF',
  cursor: 'pointer',
  padding: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  textDecoration: 'none',
  transition: 'opacity 0.15s ease',
  ':active': {
    opacity: 0.9,
  },
});
