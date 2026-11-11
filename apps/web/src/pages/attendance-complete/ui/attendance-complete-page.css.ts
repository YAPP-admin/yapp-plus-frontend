import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '100%',
  backgroundColor: vars.$color.bg.layerDefault,
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
  alignItems: 'stretch',
  flex: 1,
  minHeight: 0,
  justifyContent: 'space-between',
  padding: '0 20px',
  textAlign: 'left',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const titleSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  paddingTop: '20px',
  gap: '10px',
  width: '100%',
  textAlign: 'left',
});

export const title = style({
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: '35px',
  color: vars.$color.fg.neutral,
  margin: 0,
  textAlign: 'left',
});

export const description = style({
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '22px',
  color: vars.$color.fg.neutralMuted,
  margin: 0,
  textAlign: 'left',
});

export const graphicSection = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '350px',
  height: '180px',
  margin: '0 auto',
  flexShrink: 1,
});

export const bottomSection = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '12px 16px calc(12px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))',
  boxSizing: 'border-box',
  gap: '10px',
});

export const confirmButton = style({
  width: '100%',
  height: '52px',
  borderRadius: '12px',
});
