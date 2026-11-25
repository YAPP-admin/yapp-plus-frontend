import { style } from '@vanilla-extract/css';

export const backdrop = style({
  background: 'rgba(4, 4, 5, 0.79)',
  backdropFilter: 'blur(3px)',
});

export const positioner = style({ padding: 16 });

export const dialog = style({
  display: 'flex',
  flexDirection: 'column',
  width: 'min(660px, calc(100vw - 32px))',
  height: 'min(853px, calc(100dvh - 32px))',
  maxWidth: 'none',
  maxHeight: 'calc(100dvh - 32px)',
  overflow: 'hidden',
  border: '1px solid #38383e',
  borderRadius: 15,
  background: '#1b1b1e',
  color: '#f4f4f5',
  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
});

export const dialogHeader = style({
  position: 'relative',
  display: 'flex',
  flexShrink: 0,
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  minHeight: 120,
  padding: '24px 27px 21px',
  borderBottom: '1px solid #2a2a2e',
});

export const dialogEyebrow = style({
  margin: 0,
  color: '#5b8cff',
  fontSize: 11,
  fontWeight: 700,
  lineHeight: '15px',
});

export const dialogTitle = style({
  margin: '7px 0 0',
  color: '#f5f5f6',
  fontSize: 20,
  fontWeight: 700,
  lineHeight: '27px',
});

export const dialogDescription = style({
  margin: '7px 0 0',
  color: '#77777e',
  fontSize: 11,
  lineHeight: '15px',
});

export const closeButton = style({
  display: 'grid',
  placeItems: 'center',
  width: 24,
  height: 24,
  marginTop: 2,
  border: 0,
  background: 'transparent',
  color: '#77777e',
});

export const form = style({ display: 'flex', flex: 1, minHeight: 0, flexDirection: 'column' });

export const body = style({
  display: 'grid',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '0 27px',
  scrollbarGutter: 'stable',
});

export const section = style({
  display: 'grid',
  padding: '20px 0',
  borderBottom: '1px solid #2a2a2e',
});

export const stepHeader = style({ display: 'flex', alignItems: 'flex-start', gap: 8 });
export const stepNumber = style({
  display: 'grid',
  placeItems: 'center',
  width: 23,
  height: 23,
  flexShrink: 0,
  borderRadius: 4,
  background: 'rgba(91, 140, 255, 0.12)',
  color: '#9eb8ff',
  fontSize: 11,
  fontWeight: 700,
});
export const stepTitle = style({ margin: 0, fontSize: 11, fontWeight: 700, lineHeight: '15px' });
export const stepDescription = style({
  margin: '4px 0 0',
  color: '#65656c',
  fontSize: 11,
  lineHeight: '15px',
});
export const fieldLabel = style({
  display: 'block',
  margin: '17px 0 0',
  color: '#c9c9cd',
  fontSize: 11,
  fontWeight: 700,
});
export const required = style({ color: '#5b8cff' });

export const roleGroup = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 8,
  marginTop: 8,
});
export const roleOption = style({
  display: 'flex',
  minWidth: 0,
  height: 48,
  alignItems: 'center',
  gap: 10,
  padding: '0 12px',
  border: '1px solid #2a2a2e',
  borderRadius: 8,
  background: '#18181b',
  color: '#d0d0d4',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
});
export const roleOptionSelected = style({
  borderColor: '#5b8cff',
  background: 'rgba(91, 140, 255, 0.08)',
});
export const optionText = style({ minWidth: 0, flex: 1 });
export const radioMark = style({
  width: 14,
  height: 14,
  flexShrink: 0,
  border: '1px solid #55555c',
  borderRadius: '50%',
});
export const radioMarkSelected = style({ border: '4px solid #5b8cff' });

export const disciplineFieldLabel = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  marginTop: 17,
  color: '#c9c9cd',
  fontSize: 11,
  fontWeight: 700,
});
export const disciplineHint = style({ color: '#5e5e65', fontWeight: 400 });
export const disciplineRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 5,
  alignItems: 'center',
  margin: '9px 0 0',
  padding: 0,
  border: 0,
});
export const disciplineOption = style({
  height: 29,
  padding: '0 10px',
  border: '1px solid #2a2a2e',
  borderRadius: 15,
  background: '#18181b',
  color: '#7c7c83',
  fontSize: 11,
  cursor: 'pointer',
});
export const disciplineOptionSelected = style({
  borderColor: 'rgba(91, 140, 255, 0.45)',
  background: 'rgba(91, 140, 255, 0.12)',
  color: '#a8c0ff',
});

export const textareaLabel = style({
  display: 'block',
  marginTop: 17,
  color: '#c9c9cd',
  fontSize: 11,
  fontWeight: 700,
});
export const textarea = style({
  width: '100%',
  height: 76,
  resize: 'none',
  marginTop: 8,
  padding: '11px 12px',
  border: '1px solid #2a2a2e',
  borderRadius: 8,
  outline: 'none',
  background: '#171719',
  color: '#d2d2d5',
  font: 'inherit',
  fontSize: 11,
});

export const scheduleGroup = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
  marginTop: 18,
});
export const scheduleOption = style({
  display: 'flex',
  minWidth: 0,
  height: 52,
  alignItems: 'center',
  gap: 10,
  padding: '0 12px',
  border: '1px solid #2a2a2e',
  borderRadius: 8,
  background: '#18181b',
  color: '#d0d0d4',
  textAlign: 'left',
  cursor: 'pointer',
});
export const scheduleOptionSelected = style({
  borderColor: '#5b8cff',
  background: 'rgba(91, 140, 255, 0.08)',
});
export const scheduleIcon = style({ width: 17, height: 17, flexShrink: 0, color: '#9eb8ff' });
export const scheduleRadioMark = style({ marginLeft: 'auto' });
export const scheduleText = style({ display: 'grid', minWidth: 0, flex: 1, gap: 3 });
export const scheduleTitle = style({ fontSize: 11, fontWeight: 700 });
export const scheduleDescription = style({ color: '#63636a', fontSize: 11 });
export const scheduleDateField = style({ display: 'grid', gap: 8, marginTop: 12 });
export const datetimeLabel = style({ color: '#c9c9cd', fontSize: 11, fontWeight: 700 });
export const datetimeInput = style({
  width: '100%',
  height: 38,
  padding: '0 10px',
  border: '1px solid #2a2a2e',
  borderRadius: 8,
  outline: 'none',
  background: '#171719',
  color: '#d2d2d5',
  font: 'inherit',
  fontSize: 11,
  colorScheme: 'dark',
});
export const formError = style({ margin: '12px 0 0', color: '#ff8c8c', fontSize: 11 });

export const footer = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  minHeight: 68,
  padding: '16px 27px',
  borderTop: '1px solid #2a2a2e',
  background: '#19191c',
});
export const recipientCount = style({ margin: 0, color: '#74747b', fontSize: 11 });
export const footerActions = style({ display: 'flex', gap: 7 });
export const cancelButton = style({ height: 36, paddingInline: 16 });
export const submitButton = style({ minWidth: 72, height: 36, paddingInline: 16 });
export const submitButtonEnabled = style({
  borderColor: '#5b8cff',
  background: '#5b8cff',
  color: '#111113',
});

export const visuallyHidden = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const responsive = style({
  '@media': {
    '(width < 640px)': {
      height: 'calc(100dvh - 16px)',
      borderRadius: 12,
    },
  },
});
