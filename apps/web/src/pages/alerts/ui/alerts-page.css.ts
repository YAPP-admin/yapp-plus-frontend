import { vars } from '@seed-design/css/vars';
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
  height: '56px',
  padding: '0 16px',
  backgroundColor: '#FFFFFF',
  borderBottom: `1px solid ${vars.$color.palette.gray100}`,
});

export const headerTitle = style({
  fontSize: '18px',
  fontWeight: 700,
  color: vars.$color.palette.gray900,
  margin: 0,
});

export const headerSpacer = style({
  width: '40px',
  height: '40px',
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const listItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '16px 20px',
  borderBottom: `1px solid ${vars.$color.palette.gray100}`,
  textDecoration: 'none',
  transition: 'background-color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.$color.palette.gray100,
    },
  },
});

export const itemMessage = style({
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '22px',
  color: vars.$color.palette.gray900,
  whiteSpace: 'pre-line',
  margin: 0,
});

export const itemDate = style({
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: '18px',
  color: vars.$color.palette.gray600,
  margin: 0,
});

export const emptyContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: '64px 20px',
  gap: '16px',
});

export const emptyText = style({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '22px',
  color: vars.$color.palette.gray600,
  margin: 0,
});
