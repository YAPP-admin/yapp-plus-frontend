import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
  backgroundColor: '#FFFFFF',
});

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '54px',
  padding: '0 16px',
  backgroundColor: '#FFFFFF',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const headerTitle = style({
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: 700,
  color: '#1A1C20',
  margin: 0,
});

export const headerSpacer = style({
  width: '24px',
  height: '24px',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: '0 16px',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const listItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '20px 0',
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  boxSizing: 'border-box',
});

export const itemMessage = style({
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: 500,
  color: '#1A1C20',
  whiteSpace: 'pre-line',
  margin: 0,
});

export const itemDate = style({
  fontSize: '13px',
  lineHeight: '18px',
  fontWeight: 400,
  color: '#868B94',
  margin: 0,
});

export const emptyContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: '0 0 32px',
  gap: '20px',
});

export const emptyGraphic = style({
  width: '90px',
  height: '74px',
  userSelect: 'none',
});

export const emptyText = style({
  fontSize: '16px',
  lineHeight: '22px',
  fontWeight: 400,
  color: '#868B94',
  textAlign: 'center',
  margin: 0,
});
