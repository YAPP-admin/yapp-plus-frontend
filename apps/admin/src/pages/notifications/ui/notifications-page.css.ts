import { style } from '@vanilla-extract/css';
import { breakpoints } from '@seed-design/css/breakpoints';
import { vars } from '@seed-design/css/vars';

const narrowScreen = `(width < ${breakpoints.lg}px)`;

export const page = style({
  display: 'grid',
  width: 'min(100%, 75rem)',
  marginInline: 'auto',
  padding: '48px 44px 100px',
  '@media': {
    [narrowScreen]: {
      padding: '32px 16px 80px',
    },
  },
});

export const historySection = style({
  display: 'grid',
  gap: 14,
  marginTop: 39,
});

export const historyHeader = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: vars.$dimension.x4,
  minHeight: 82,
  paddingInline: 1,
});

export const historyHeading = style({ display: 'grid', gap: 6 });

export const historyTitle = style({
  margin: 0,
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t5,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t5,
});

export const historyDescription = style({
  margin: 0,
  color: '#707077',
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.regular,
  lineHeight: vars.$lineHeight.t1,
});

export const historyCount = style({
  margin: 0,
  color: '#66666d',
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.regular,
  lineHeight: vars.$lineHeight.t1,
  whiteSpace: 'nowrap',
});

export const historyCountStrong = style({ color: '#dddde0', fontWeight: vars.$fontWeight.bold });

export const historyCard = style({
  display: 'grid',
  gridTemplateRows: '42px auto',
  minHeight: 445,
  overflow: 'hidden',
  border: '1px solid #2a2a2e',
  borderRadius: 12,
  background: 'rgba(28, 28, 31, 0.78)',
});

export const tableHeader = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 244px 211px 122px 56px',
  alignItems: 'center',
  gap: 0,
  paddingInline: 20,
  borderBottom: '1px solid #2a2a2e',
  background: '#19191c',
  '@media': {
    [narrowScreen]: {
      gridTemplateColumns: 'minmax(180px, 1fr) 150px 135px 80px 44px',
      minWidth: 640,
    },
  },
});

export const tableHeaderRow = style({ display: 'contents' });

export const tableHeaderCell = style({
  color: '#65656c',
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.regular,
  lineHeight: vars.$lineHeight.t1,
});

export const tableBody = style({
  display: 'grid',
  minHeight: 401,
});

export const statusState = style({
  display: 'flex',
  minHeight: 401,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: `${vars.$dimension.x10} ${vars.$dimension.x5}`,
  color: '#8c8c93',
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
  textAlign: 'center',
});

export const loadMoreSentinel = style({
  minHeight: 1,
  color: '#65656c',
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
  textAlign: 'center',
});

export const tableRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 244px 211px 122px 56px',
  minHeight: 69,
  borderBottom: '1px solid #27272b',
  '@media': {
    [narrowScreen]: {
      gridTemplateColumns: 'minmax(180px, 1fr) 150px 135px 80px 44px',
      minWidth: 640,
    },
  },
});

export const tableCell = style({
  display: 'flex',
  minWidth: 0,
  alignItems: 'center',
  paddingInline: 18,
});

export const contentCell = style({
  gap: 11,
});

export const notificationIcon = style({
  display: 'grid',
  placeItems: 'center',
  width: 30,
  height: 30,
  flexShrink: 0,
  border: '1px solid #333338',
  borderRadius: 8,
  background: '#242428',
  color: '#b3b8c8',
});

export const notificationTitle = style({
  minWidth: 0,
  overflow: 'hidden',
  color: '#d2d2d5',
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.regular,
  lineHeight: vars.$lineHeight.t1,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const cellText = style({
  overflow: 'hidden',
  color: '#8c8c93',
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const statusBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  height: 22,
  paddingInline: 8,
  borderRadius: 5,
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t1,
  whiteSpace: 'nowrap',
});

export const statusBadgeScheduled = style({
  background: 'rgba(91, 140, 255, 0.11)',
  color: '#9db8ff',
});

export const statusBadgeCompleted = style({
  background: 'rgba(65, 198, 137, 0.11)',
  color: '#7ed9ae',
});

export const statusBadgeFailed = style({
  background: 'rgba(255, 90, 90, 0.11)',
  color: '#ff8c8c',
});

export const statusDot = style({
  width: 5,
  height: 5,
  flexShrink: 0,
  borderRadius: 2.5,
  background: 'currentColor',
});

export const rowActionCell = style({
  position: 'relative',
  justifyContent: 'center',
  paddingInline: 0,
});

export const rowAction = style({
  display: 'grid',
  placeItems: 'center',
  width: 27,
  height: 27,
  border: '1px solid #37373d',
  borderRadius: 7,
  background: '#27272b',
  color: '#c8c8cc',
});

export const cancelMenu = style({
  position: 'absolute',
  top: 52,
  right: 8,
  zIndex: 1,
  width: 105,
  padding: 5,
  border: '1px solid #3a3a40',
  borderRadius: 8,
  background: '#252529',
  boxShadow: '0 14px 15px rgba(0, 0, 0, 0.42)',
});

export const cancelMenuItem = style({
  width: '100%',
  height: 30,
  paddingInline: 8,
  border: 0,
  borderRadius: 5,
  background: 'transparent',
  color: '#ff5a5a',
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
  textAlign: 'left',
});

export const listActionRow = style({
  position: 'fixed',
  right: 32,
  bottom: 32,
  zIndex: 10,
  display: 'flex',
  justifyContent: 'flex-end',
  '@media': {
    [narrowScreen]: {
      right: 16,
      bottom: 16,
    },
  },
});

export const emptyState = style({
  display: 'grid',
  placeItems: 'center',
  minHeight: 401,
  padding: `${vars.$dimension.x10} ${vars.$dimension.x5}`,
});

export const emptyContent = style({
  display: 'grid',
  justifyItems: 'center',
  alignContent: 'center',
});

export const emptyIllustration = style({
  position: 'relative',
  width: 112,
  height: 96,
});

export const illustrationOrbit = style({
  position: 'absolute',
  top: 10,
  left: 18,
  width: 76,
  height: 76,
  border: '1px solid #2b2f38',
  borderRadius: vars.$radius.full,
});

export const illustrationTiltedOrbit = style({
  position: 'absolute',
  top: 19,
  left: 7,
  width: 98,
  height: 58,
  transform: 'rotate(-18deg)',
  border: '1px solid #2b2f38',
  borderRadius: 38,
});

export const illustrationDotTop = style({
  position: 'absolute',
  top: 11,
  left: 93,
  width: 4,
  height: 4,
  borderRadius: 2,
  background: '#5b8cff',
});

export const illustrationDotBottom = style({
  position: 'absolute',
  top: 78,
  left: 8,
  width: 3,
  height: 3,
  borderRadius: 1.5,
  opacity: 0.55,
  background: '#5b8cff',
});

export const illustrationIconBox = style({
  position: 'absolute',
  top: 23,
  left: 31,
  display: 'grid',
  placeItems: 'center',
  width: 50,
  height: 50,
  border: '1px solid #333842',
  borderRadius: 15,
  background: 'linear-gradient(145deg, #252830 6.17%, #191a1e 93.83%)',
  boxShadow: '0 14px 14px rgba(0, 0, 0, 0.25)',
});

export const emptyTitle = style({
  margin: '15px 0 0',
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t5,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t5,
});

export const emptyDescription = style({
  margin: `${vars.$dimension.x2} 0 0`,
  color: '#707077',
  fontSize: vars.$fontSize.t1,
  fontWeight: vars.$fontWeight.regular,
  lineHeight: vars.$lineHeight.t1,
});

export const sendButton = style({
  display: 'inline-flex',
  gap: 9,
  height: 50,
  paddingInline: 20,
  border: 0,
  borderRadius: 25,
  background: '#ffffff',
  color: '#111113',
  boxShadow: '0 12px 15px rgba(0, 0, 0, 0.4)',
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t2,
});
