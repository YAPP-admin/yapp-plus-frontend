import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const page = style({
  minHeight: '100dvh',
  padding: 'clamp(80px, 31.944vh, 345px) 24px 48px',
  background: '#0f0f12',
  color: '#fff',
  colorScheme: 'dark',
  '@media': { '(max-width: 767px)': { paddingTop: '64px' } },
});

export const layout = style({
  display: 'grid',
  gridTemplateColumns: '250px minmax(0, 402px)',
  columnGap: 'clamp(48px, 23.403vw, 337px)',
  maxWidth: '1058px',
  marginInline: 'auto',
  alignItems: 'start',
  '@media': {
    '(max-width: 1100px)': { columnGap: '48px', justifyContent: 'center' },
    '(max-width: 767px)': { gridTemplateColumns: 'minmax(0, 402px)', rowGap: '48px' },
  },
});

export const brand = style({
  margin: 0,
  fontSize: '100px',
  fontWeight: 600,
  lineHeight: 1.5,
  letterSpacing: '0.57px',
  textAlign: 'center',
  '@media': { '(max-width: 767px)': { fontSize: '64px' } },
});

export const brandSubtitle = style({
  display: 'block',
  marginTop: '-33px',
  fontSize: '50px',
  letterSpacing: '0.285px',
  '@media': { '(max-width: 767px)': { marginTop: '-16px', fontSize: '32px' } },
});

export const form = style({ width: '100%', minWidth: 0 });
export const fields = style({ display: 'grid', gap: '17px' });
export const field = style({ display: 'grid', gap: '6px' });
export const label = style({
  color: '#808087',
  fontSize: '14px',
  fontWeight: vars.$fontWeight.medium,
  lineHeight: '20px',
  letterSpacing: '-0.28px',
});

export const input = style({
  width: '100%',
  minWidth: 0,
  height: '44px',
  padding: '10px 14px',
  border: '1px solid transparent',
  borderRadius: '8px',
  background: '#202025',
  color: '#fff',
  fontSize: '16px',
  lineHeight: '24px',
  letterSpacing: '-0.32px',
  selectors: {
    '&::placeholder': { color: '#66666d' },
    '&:focus-visible': { outline: '2px solid #fff', outlineOffset: '3px' },
    '&[aria-invalid="true"]': { borderColor: '#f04251' },
    '&:disabled': { opacity: 0.6 },
  },
});

export const submit = style({
  selectors: {
    '&&': {
      width: '100%',
      height: '56px',
      marginTop: '40px',
      borderRadius: '10px',
      background: '#fff',
      color: '#000',
      fontSize: '18px',
      fontWeight: vars.$fontWeight.bold,
    },
    '&&:focus-visible': { outline: '2px solid #fff', outlineOffset: '4px' },
    '&&:disabled': { opacity: 0.6 },
  },
});

export const feedback = style({
  minHeight: '24px',
  margin: '40px 0 0',
  color: '#f04251',
  fontSize: '16px',
  fontWeight: vars.$fontWeight.medium,
  lineHeight: '24px',
  letterSpacing: '-0.32px',
  textAlign: 'center',
  overflowWrap: 'anywhere',
});

export const fieldError = style({
  margin: 0,
  color: '#f04251',
  fontSize: '14px',
  lineHeight: '20px',
});
