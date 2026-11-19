/** 회식 목록의 피그마 간격과 SEED 색상 토큰을 연결합니다. */
import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100%',
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutral,
});

export const listPage = style({
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  minHeight: '100%',
});

export const communityHeader = style({ padding: '20px 20px 0' });

export const communityTabs = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  marginTop: '22px',
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const communityTab = style({
  position: 'relative',
  display: 'flex',
  minHeight: '44px',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  background: 'transparent',
  color: vars.$color.fg.neutralSubtle,
  fontSize: vars.$fontSize.t5,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t5,
});

export const communityTabSelected = style({
  color: vars.$color.fg.neutral,
  selectors: {
    '&::after': {
      position: 'absolute',
      right: 0,
      bottom: '-1px',
      left: 0,
      height: '2px',
      background: vars.$color.fg.neutral,
      content: '',
    },
  },
});

export const notificationDot = style({
  position: 'absolute',
  top: '8px',
  marginLeft: '42px',
  width: '6px',
  height: '6px',
  borderRadius: vars.$radius.full,
  background: vars.$color.fg.brand,
});

export const listContent = style({ minHeight: 0, padding: '12px 20px 14px' });

export const filterList = style({
  display: 'flex',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: '0 0 4px',
  listStyle: 'none',
  overflowX: 'auto',
  scrollbarWidth: 'none',
});

export const filterButton = style({
  minWidth: '48px',
  height: '36px',
  padding: `0 ${vars.$dimension.x3_5}`,
  border: 0,
  borderRadius: vars.$radius.full,
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.medium,
  lineHeight: vars.$lineHeight.t4,
  whiteSpace: 'nowrap',
});

export const filterButtonSelected = style({
  background: vars.$color.bg.neutralSolid,
  color: vars.$color.fg.onNeutralSolid,
});

export const diningList = style({ margin: 0, padding: 0, listStyle: 'none' });

export const diningCard = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  gap: vars.$dimension.x2_5,
  padding: `${vars.$dimension.x4} 0`,
  border: 0,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  background: 'transparent',
  color: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
});

export const deadlineChip = style({
  width: 'fit-content',
  minHeight: '20px',
  padding: '2px 6px',
  borderRadius: vars.$radius.r1,
  background: vars.$color.bg.brandWeak,
  color: vars.$color.fg.brandContrast,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t1,
});

export const deadlineChipClosed = style({
  background: vars.$color.bg.neutralWeak,
  color: vars.$color.fg.neutralMuted,
});

export const cardMeta = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x2,
});

export const calendarMeta = style({
  display: 'flex',
  minWidth: 0,
  alignItems: 'center',
  gap: vars.$dimension.x1,
});

export const calendarIcon = style({
  width: '14px',
  height: '14px',
  flex: '0 0 auto',
  color: vars.$color.fg.neutralSubtle,
});
