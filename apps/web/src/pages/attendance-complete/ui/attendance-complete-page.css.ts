import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '100dvh',
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '56px',
  padding: '0 16px',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const headerSpacer = style({
  width: '40px',
  height: '40px',
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: '20px 20px 30px',
  textAlign: 'center',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const titleSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '32px',
  width: '100%',
});

export const title = style({
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: '35px',
  color: vars.$color.palette.gray900,
  margin: 0,
});

export const description = style({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '22px',
  color: vars.$color.palette.gray700,
  margin: 0,
});

export const graphicSection = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '320px',
  height: '220px',
  margin: '0 auto',
});

export const bottomSection = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '12px 20px 20px',
  boxSizing: 'border-box',
  gap: '8px',
});

export const confirmButton = style({
  width: '100%',
  height: '52px',
  borderRadius: '12px',
});

export const homeIndicatorArea = style({
  height: '24px',
});
