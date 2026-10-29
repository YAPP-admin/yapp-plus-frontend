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
  flex: 1,
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '16px 20px 24px',
  boxSizing: 'border-box',
  justifyContent: 'space-between',
  gap: '20px',
});

export const titleSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  textAlign: 'left',
  alignItems: 'flex-start',
  width: '100%',
});

export const title = style({
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: '35px',
  color: vars.$color.palette.gray900,
  margin: 0,
  textAlign: 'left',
  width: '100%',
});

export const description = style({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '22px',
  color: vars.$color.palette.gray700,
  margin: 0,
  textAlign: 'left',
  width: '100%',
});

export const graphicSection = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '320px',
  height: '180px',
  margin: '0 auto',
});

export const infoCard = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: '18px',
  gap: '14px',
  backgroundColor: vars.$color.palette.gray100,
  borderRadius: '8px',
  boxSizing: 'border-box',
});

export const infoRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
});

export const infoLabel = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '19px',
  color: vars.$color.palette.gray700,
  margin: 0,
  whiteSpace: 'nowrap',
});

export const infoDotLine = style({
  flex: 1,
  height: '1px',
  borderBottom: '1px dashed #DCDEE3',
  alignSelf: 'center',
});

export const infoValue = style({
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '19px',
  color: vars.$color.palette.gray900,
  margin: 0,
  textAlign: 'right',
  whiteSpace: 'nowrap',
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
