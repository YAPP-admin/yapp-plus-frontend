import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
  background: vars.$color.bg.layerDefault,
  minHeight: '100%',
  padding: `14px ${vars.$dimension.x5} 60px`,
});

export const headerSection = style({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '20px',
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  marginBottom: '24px',
});

export const metaInfoRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const baseChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3px 6px',
  borderRadius: '4px',
  fontSize: vars.$fontSize.t2,
  lineHeight: vars.$lineHeight.t2,
  fontWeight: vars.$fontWeight.bold,
  flexShrink: 0,
});

export const sessionChip = style([
  baseChip,
  {
    background: vars.$color.bg.informativeWeak,
    color: vars.$color.fg.informative,
  },
]);

export const assignmentChip = style([
  baseChip,
  {
    background: vars.$color.bg.positiveWeak,
    color: vars.$color.fg.positive,
  },
]);

export const etcChip = style([
  baseChip,
  {
    background: vars.$color.bg.neutralMuted,
    color: vars.$color.fg.neutralMuted,
  },
]);

export const dDayChip = style([
  baseChip,
  {
    background: vars.$color.bg.warningWeak,
    color: vars.$color.fg.warning,
  },
]);

export const titleText = style({
  fontSize: vars.$fontSize.t7,
  lineHeight: vars.$lineHeight.t7,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
  marginBottom: '10px',
});

export const dateText = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  margin: 0,
});

export const metaBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px 18px',
  borderRadius: '8px',
  background: vars.$color.bg.neutralMuted,
  marginBottom: '28px',
});

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

export const metaLabel = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  width: '64px',
  flexShrink: 0,
});

export const metaValue = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const metaLink = style({
  color: vars.$color.fg.neutralMuted,
  textDecoration: 'underline',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
});

export const contentSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  marginBottom: '48px',
});

export const paragraph = style({
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutral,
  margin: 0,
  whiteSpace: 'pre-line',
});

export const confirmSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  padding: '24px 0',
});

export const confirmTextGroup = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
});

export const confirmQuestion = style({
  fontSize: vars.$fontSize.t5,
  lineHeight: vars.$lineHeight.t5,
  fontWeight: vars.$fontWeight.bold,
  color: vars.$color.fg.neutral,
  margin: 0,
});

export const confirmCount = style({
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
  fontWeight: vars.$fontWeight.medium,
  color: vars.$color.fg.neutralMuted,
  margin: 0,
});

export const checkButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '10px 18px',
  borderRadius: '9999px',
  border: 'none',
  fontSize: vars.$fontSize.t4,
  lineHeight: vars.$lineHeight.t4,
  fontWeight: vars.$fontWeight.bold,
  cursor: 'pointer',
  touchAction: 'manipulation',
  transition: 'background-color 150ms ease, transform 100ms ease',
  ':active': {
    transform: 'scale(0.96)',
  },
  ':focus-visible': {
    outline: `2px solid ${vars.$color.fg.brand}`,
    outlineOffset: '2px',
  },
});

export const checkButtonUnconfirmed = style([
  checkButton,
  {
    background: vars.$color.bg.neutralMuted,
    color: vars.$color.fg.neutralMuted,
  },
]);

export const checkButtonConfirmed = style([
  checkButton,
  {
    background: vars.$color.bg.brandSolid,
    color: vars.$color.palette.gray00,
  },
]);
