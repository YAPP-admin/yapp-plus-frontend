import { keyframes, style } from '@vanilla-extract/css';

const floatZ3 = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate(0, 4px) scale(0.9)',
  },
  '20%': {
    opacity: 0.9,
    transform: 'translate(-2px, -2px) scale(1)',
  },
  '70%': {
    opacity: 0.7,
    transform: 'translate(-4px, -10px) scale(1.05)',
  },
  '100%': {
    opacity: 0,
    transform: 'translate(-6px, -16px) scale(1.1)',
  },
});

const floatZ2 = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate(0, 4px) scale(0.9)',
  },
  '25%': {
    opacity: 0.9,
    transform: 'translate(-2px, -3px) scale(1)',
  },
  '75%': {
    opacity: 0.7,
    transform: 'translate(-5px, -12px) scale(1.05)',
  },
  '100%': {
    opacity: 0,
    transform: 'translate(-8px, -18px) scale(1.1)',
  },
});

const floatZ1 = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate(0, 4px) scale(0.9)',
  },
  '30%': {
    opacity: 0.9,
    transform: 'translate(-3px, -4px) scale(1)',
  },
  '80%': {
    opacity: 0.7,
    transform: 'translate(-6px, -14px) scale(1.05)',
  },
  '100%': {
    opacity: 0,
    transform: 'translate(-10px, -22px) scale(1.1)',
  },
});

const breathe = keyframes({
  '0%, 100%': {
    transform: 'translateY(0)',
  },
  '50%': {
    transform: 'translateY(0.8px)',
  },
});

export const illustration = style({
  position: 'relative',
  width: '100%',
  maxWidth: '350px',
  height: 'auto',
  aspectRatio: '350 / 170',
  margin: 0,
  userSelect: 'none',
  display: 'block',
});

export const svgRoot = style({
  width: '100%',
  height: '100%',
  display: 'block',
  overflow: 'visible',
});

export const owlHead = style({
  transformOrigin: '190px 125px',
  animation: `${breathe} 3s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const zPath3 = style({
  transformOrigin: '122px 79px',
  animation: `${floatZ3} 2.6s ease-in-out infinite`,
  animationDelay: '0s',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 1,
    },
  },
});

export const zPath2 = style({
  transformOrigin: '105px 75px',
  animation: `${floatZ2} 2.6s ease-in-out infinite`,
  animationDelay: '0.8s',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 1,
    },
  },
});

export const zPath1 = style({
  transformOrigin: '87px 61px',
  animation: `${floatZ1} 2.6s ease-in-out infinite`,
  animationDelay: '1.6s',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 1,
    },
  },
});
