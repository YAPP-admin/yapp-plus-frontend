import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const page = style({
  width: 'min(100%, 48rem)',
  marginInline: 'auto',
  padding: `${vars.$dimension.x8} ${vars.$dimension.x6} ${vars.$dimension.x12}`,
  '@media': {
    'screen and (max-width: 48rem)': {
      padding: `${vars.$dimension.x8} ${vars.$dimension.x4}`,
    },
  },
});

export const heading = style({
  marginBottom: vars.$dimension.x8,
});

export const eyebrow = style({
  margin: 0,
  color: vars.$color.fg.brand,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.bold,
  letterSpacing: '0.04em',
  lineHeight: vars.$lineHeight.t2,
});

export const title = style({
  margin: `${vars.$dimension.x2} 0 ${vars.$dimension.x1}`,
  fontSize: vars.$fontSize.t8,
  fontWeight: vars.$fontWeight.bold,
  lineHeight: vars.$lineHeight.t8,
});

export const description = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t3,
  lineHeight: vars.$lineHeight.t3,
});

export const introductionTextarea = style({
  minHeight: '4rem',
});

export const form = style({
  overflow: 'hidden',
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
});

export const fields = style({
  display: 'grid',
  gap: vars.$dimension.x5,
  margin: 0,
  padding: vars.$dimension.x6,
  border: 0,
  minWidth: 0,
});

export const field = style({
  minWidth: 0,
});

export const schedule = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.$dimension.x5,
  '@media': {
    'screen and (max-width: 36rem)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const fieldLabel = style({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: vars.$dimension.x0_5,
});

export const required = style({
  color: vars.$color.fg.brand,
});

export const dateTimeFields = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.8fr) minmax(7rem, 0.8fr)',
  gap: vars.$dimension.x3,
  '@media': {
    'screen and (max-width: 28rem)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const inviteOptions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.$dimension.x2,
  marginTop: vars.$dimension.x2,
  padding: 0,
  border: 0,
});

export const inviteLegend = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const visuallyHidden = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const inviteOption = style({
  display: 'inline-flex',
  minHeight: '2.25rem',
  alignItems: 'center',
  gap: vars.$dimension.x1,
  padding: `0 ${vars.$dimension.x3}`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerDefault,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.medium,
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.stroke.focusRing}`,
      outlineOffset: '2px',
    },
  },
});

export const inviteOptionSelected = style({
  borderColor: vars.$color.stroke.informativeSolid,
  background: vars.$color.bg.informativeWeak,
  color: vars.$color.fg.informative,
  fontWeight: vars.$fontWeight.bold,
});

export const inviteOptionCheck = style({
  color: vars.$color.fg.informative,
  fontWeight: vars.$fontWeight.bold,
});

export const inviteCategory = style({
  display: 'inline-flex',
  minHeight: '2.25rem',
  alignItems: 'center',
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t2,
  fontWeight: vars.$fontWeight.medium,
});

export const generationSelect = style({
  width: '7rem',
});

export const inviteDescription = style({
  margin: `${vars.$dimension.x2} 0 0`,
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
});

export const previewError = style({
  margin: `${vars.$dimension.x2} 0 0`,
  color: vars.$color.fg.critical,
  fontSize: vars.$fontSize.t1,
  lineHeight: vars.$lineHeight.t1,
});

export const maxAttendeesField = style({
  width: '9rem',
  '@media': {
    'screen and (max-width: 28rem)': {
      width: '100%',
    },
  },
});

export const actions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
  padding: vars.$dimension.x4,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
});

export const primaryButton = style({
  background: vars.$color.bg.informativeSolid,
  color: vars.$color.fg.onInformativeSolid,
  vars: {
    '--seed-icon-color': vars.$color.fg.onInformativeSolid,
    '--seed-prefix-icon-color': vars.$color.fg.onInformativeSolid,
    '--seed-suffix-icon-color': vars.$color.fg.onInformativeSolid,
  },
  selectors: {
    '&:hover': { background: vars.$color.bg.informativeSolidPressed },
    '&:active': { background: vars.$color.bg.informativeSolidPressed },
  },
});
